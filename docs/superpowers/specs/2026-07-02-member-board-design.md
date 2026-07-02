# 일반회원 게시판 (Member Board) — 설계 문서

- **작성일**: 2026-07-02
- **대상 프로젝트**: pine-nut (`website/`)
- **상태**: 설계 확정, 구현 계획 작성 예정

## 1. 배경 / 목적

공개 회원제 전환으로 일반회원(가입=pending)이 생겼다. 이들이 참여할 **일반회원용 게시판**을
만든다. 누구나 읽고, 로그인 회원만 글·댓글을 쓴다. 기획단(관리자)은 부적절한 글을 숨기거나
삭제한다.

회원 테이블은 `admin_members`(가입=pending 일반회원, owner가 역할 부여=기획단). 게시판은
pine-nut 신규. peace/kosmart의 board_* 스키마는 참조만 하고 pine-nut 패턴으로 새로 작성한다.

## 2. 범위 (확정)

- 접근: **누구나 읽기 · 회원(pending 포함 활성)만 쓰기**
- 구조: **단일 게시판 + 글(post) + 댓글(comment)** (카테고리 없음)
- 작성자 표시: **닉네임**(`admin_members.display_name`) — 없으면 작성 전 설정 필요
- 운영: **본인 수정/삭제 + 기획단(editor+) 숨김(블라인드)/삭제**, 소프트삭제로 복구 가능

### 비범위 (v1 이후)
카테고리/다중 게시판, 좋아요, 이미지·첨부, 신고, 대댓글(중첩), 검색, 알림, 다국어(/en).

## 3. 아키텍처

기존 pine-nut 패턴(App Router + 서버액션 + Supabase RLS + 소프트삭제 + audit_log) 위에 얹는다.

| 구성 | 경로 |
|------|------|
| 목록(공개) | `src/app/board/page.tsx` |
| 상세+댓글(공개) | `src/app/board/[id]/page.tsx` |
| 작성(회원) | `src/app/board/new/page.tsx` |
| 수정(본인) | `src/app/board/[id]/edit/page.tsx` |
| 서버액션 | `src/lib/actions/board.ts` (글/댓글 CRUD + 모더레이션 + 닉네임) |
| 데이터 페처 | `src/lib/data/board.ts` (`getBoardPosts`, `getBoardPost`) |

- 회원 판정 함수 신규 `is_member()`, 모더레이션은 기존 `admin_can_edit()`(editor+).
- 헤더/네비에 "게시판"(`/board`) 링크 추가(공개).

## 4. 데이터 모델

### `board_posts`
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | BIGINT GENERATED ALWAYS AS IDENTITY PK | |
| author_user_id | uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | 작성자, 본인확인·RLS용 |
| title | text NOT NULL | 제목 |
| content | text NOT NULL | 본문 |
| is_deleted | boolean NOT NULL DEFAULT false | 작성자/기획단 삭제(소프트) |
| is_hidden | boolean NOT NULL DEFAULT false | 기획단 블라인드 |
| created_at | timestamptz NOT NULL DEFAULT now() | |
| updated_at | timestamptz NOT NULL DEFAULT now() | update 트리거 `update_updated_at()` 재사용 |

### `board_comments`
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | BIGINT IDENTITY PK | |
| post_id | BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE | |
| author_user_id | uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | |
| content | text NOT NULL | |
| is_deleted | boolean NOT NULL DEFAULT false | |
| is_hidden | boolean NOT NULL DEFAULT false | |
| created_at / updated_at | timestamptz | |

- 인덱스: `board_posts(created_at DESC) WHERE NOT is_deleted`; `board_comments(post_id, created_at)`.
- 작성자 이름: `admin_members.display_name`을 `author_user_id = admin_members.user_id`로 조인해
  **항상 최신 닉네임** 표시(스냅샷 안 함). 닉네임 미설정(null)이면 표시는 "회원"(fallback), 단
  **작성 자체는 닉네임 필수**(4.3).

## 5. 접근 · RLS (이중 방어)

### 5.1 신규 함수 `is_member()` (SECURITY DEFINER)
```sql
CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
```
(role 무관 = pending 포함 활성 회원. `is_active_admin()`은 pending 제외이므로 별도 필요.)
`GRANT EXECUTE ... TO authenticated, anon`.

### 5.2 RLS 정책 (board_posts, board_comments 동일 패턴)
- **SELECT (공개)**: `TO anon, authenticated USING (NOT is_deleted AND NOT is_hidden)` — 일반 공개.
- **SELECT (기획단 전체)**: `TO authenticated USING (is_active_admin())` — 숨김·삭제 포함 열람(모더레이션).
- **INSERT**: `TO authenticated WITH CHECK (is_member() AND author_user_id = auth.uid())`.
- **UPDATE (본인)**: `TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid())`.
- **UPDATE (기획단)**: `TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit())` — 숨김/삭제 토글.
- **DELETE**: 물리 DELETE 정책 없음. 모든 삭제는 소프트삭제(UPDATE `is_deleted=true`)로 처리 →
  본인/기획단 UPDATE 정책이 커버. (부모 글 물리 삭제 시 자식 댓글 CASCADE는 FK 레벨이며 앱은 사용 안 함.)

### 5.3 앱 레벨 게이트
- 작성/수정 액션: `is_member`에 대응하는 앱 헬퍼(신규 `requireMember()`, `@/lib/actions/auth`) — 활성 회원 아니면 `{error}`.
- 모더레이션 액션: 기존 `requireEditor()`(editor+).
- 본인 확인: 액션에서 `author_user_id === user.id` 검증(+RLS 이중).
- 모든 변경 audit_log 기록(table_name `board_posts`/`board_comments`).

## 6. 페이지 · 흐름

### 6.1 목록 `/board` (공개, 서버 컴포넌트)
- 글 목록(제목·닉네임·작성일·댓글 수), 최신순, 페이지네이션(20/page). 로그인 회원에게 "글쓰기"(`/board/new`).
- 삭제/숨김 글은 일반 사용자에게 미표시(RLS). 기획단에겐 "숨김됨/삭제됨" 배지로 보임.

### 6.2 상세 `/board/[id]` (공개)
- 제목·작성자·본문·작성일 + 댓글 목록 + (회원) 댓글 입력폼.
- 본인 글/댓글: 수정·삭제 버튼. 기획단(editor+): 숨김·삭제 버튼(인라인 모더레이션).
- 클라이언트 액션 컴포넌트로 댓글 작성/삭제, 모더레이션 버튼 처리.

### 6.3 작성/수정 `/board/new`, `/board/[id]/edit` (회원/본인)
- 제목·본문 입력. 서버액션이 회원·본인·닉네임 확인. 성공 시 상세로 이동.

### 6.4 닉네임 흐름 (핵심)
- 글/댓글 작성 서버액션은 `display_name` 필수: 없으면 `{ error: "닉네임을 먼저 설정해주세요." }`.
- **`/mypage`에 닉네임 설정/변경 필드 추가**(본인만, 서버액션 `setMyNickname`이 `admin_members.display_name` 업데이트).
- 작성 페이지에서 닉네임 미설정 시 안내 + `/mypage` 링크(또는 인라인 설정 유도).

## 7. 모더레이션
- 기획단(editor+): 글/댓글 숨김(is_hidden 토글)·삭제(is_deleted true). 소프트라 복구(토글) 가능.
- 본인: 자기 글/댓글 수정·삭제(is_deleted true).
- 모든 모더레이션/삭제 audit_log 기록.

## 8. 에러처리 · 검증
- 서버액션 반환 `ActionState`(`{error}|null`), 친화적 한글 메시지.
- 입력 검증: 제목/본문/댓글 비어있음 방지, 길이 상한(제목 200, 본문/댓글 합리적 상한).
- 검증: `npm run build` + `npm run lint`. 수동: 비로그인 읽기 / 회원 작성·수정·삭제 / 닉네임 없음→차단→설정 후 작성 / 기획단 숨김·삭제 / 숨김글 공개 미표시·기획단 표시.
- 마이그레이션 적용은 CLI(`supabase db push`), 사용자 승인 후. `is_member()` 정의·정책 라이브 감사.

## 9. 비고 (보안)
- 오픈 가입 회원이 글을 쓰므로 스팸 여지 → 가입 rate-limit/CAPTCHA(별도 미해결 후속)와 연결. v1은
  소프트삭제·숨김으로 대응. 필요 시 게시 rate-limit 후속.
