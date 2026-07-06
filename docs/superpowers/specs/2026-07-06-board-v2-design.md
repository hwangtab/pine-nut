# 게시판 v2 (카테고리·좋아요·이미지·신고·검색) — 설계 문서

- **작성일**: 2026-07-06
- **대상 프로젝트**: pine-nut (`website/`)
- **상태**: 설계 확정. 구현은 단계별(독립 배포)로 진행.

## 1. 배경 / 목적

일반회원 게시판(공개읽기·회원쓰기·RLS 3중방어·닉네임 스냅샷) 위에 5개 기능을 얹는다:
카테고리, 검색, 좋아요, 이미지 첨부, 신고. 각 기능은 독립적이라 개별 마이그레이션 + PR로
배포할 수 있다.

기존 구조(참고): `board_posts`(author_user_id, author_nickname, title, content, is_deleted,
is_hidden), `board_comments`, 함수 `is_member()`(pending 포함 활성 회원), `admin_can_edit()`(editor+),
`is_active_admin()`, 앱 게이트 `requireMember()`/`requireEditor()`, `board_guard_is_hidden` 트리거.

## 2. 분해 · 구현 순서

가벼운 것 → 무거운 것. 각 단계 완료 시 배포 가능:
1. **카테고리 + 검색** — 스키마 가벼움, 목록 UI만 변경(함께 묶음)
2. **좋아요** — 테이블 1개 + 토글
3. **이미지 첨부** — 스토리지 버킷 + 업로드 UI(가장 무거움)
4. **신고 + 검토큐** — 테이블 + `/admin/board-reports`

각 단계는 별도 구현 계획(writing-plans)으로 나눠 진행한다.

## 3. 데이터 모델

### 3.1 board_posts 컬럼 추가 (단계 1)
```sql
ALTER TABLE board_posts ADD COLUMN category TEXT NOT NULL DEFAULT '자유'
  CHECK (category IN ('자유','질문','제안','후기'));
CREATE INDEX idx_board_posts_category ON board_posts (category) WHERE NOT is_deleted;
```

### 3.2 board_post_likes (단계 2)
| 컬럼 | 타입 |
|------|------|
| id | BIGINT IDENTITY PK |
| post_id | BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE |
| user_id | uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE |
| created_at | timestamptz NOT NULL DEFAULT now() |
| — | **UNIQUE(post_id, user_id)** (1인 1회) |

### 3.3 board_post_images (단계 3)
| 컬럼 | 타입 |
|------|------|
| id | BIGINT IDENTITY PK |
| post_id | BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE |
| storage_path | text NOT NULL |
| sort_order | int NOT NULL DEFAULT 0 |
| created_at | timestamptz NOT NULL DEFAULT now() |
- 스토리지: 공개 버킷 `board-images`(회원 업로드, anon 읽기).

### 3.4 board_reports (단계 4)
| 컬럼 | 타입 |
|------|------|
| id | BIGINT IDENTITY PK |
| target_type | text NOT NULL CHECK (target_type IN ('post','comment')) |
| target_id | BIGINT NOT NULL |
| reporter_user_id | uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE |
| reason | text NOT NULL |
| status | text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')) |
| created_at | timestamptz NOT NULL DEFAULT now() |
| — | **UNIQUE(target_type, target_id, reporter_user_id)** (중복신고 방지) |

## 4. 기능별 흐름 · RLS · UI

### 4.1 카테고리 (단계 1)
- 작성/수정 폼에 카테고리 `<select>`(자유/질문/제안/후기, 기본 '자유'). `createBoardPost`/`updateBoardPost`가
  category 검증(허용값)·저장.
- 목록/상세에 카테고리 배지. 목록 `/board?category=질문` 필터(탭/드롭다운).
- RLS 불필요: category는 board_posts의 일반 컬럼, 기존 정책이 커버.

### 4.2 검색 (단계 1)
- 목록 `/board?q=검색어` → `getBoardPosts(page, {category?, q?})`가 제목·본문 ILIKE.
- **인젝션 방지**: PostgREST `.or()` 필터 문자열에 사용자 입력을 그대로 넣지 않는다. 예약문자
  (`%`,`,`,`(`,`)`,`.`,`*`,`\`,`"`)를 이스케이프하는 헬퍼로 감싸거나, `title.ilike`·`content.ilike`를
  각각 파라미터화해 두 번 질의 후 앱에서 병합·페이지네이션한다. 검색 + category 동시 적용.
- 목록 상단에 검색창 + 카테고리 필터.

### 4.3 좋아요 (단계 2)
- RLS(board_post_likes): SELECT 공개(anon, 집계용); INSERT/DELETE `TO authenticated USING/CHECK
  (is_member() AND user_id = auth.uid())` (본인 것만).
- 서버액션 `togglePostLike(postId)`: requireMember → 본인 like 있으면 delete, 없으면 insert(UNIQUE 위반은
  친화적 처리). audit 선택.
- 상세/목록에 좋아요 수 + 하트 토글(회원). 비로그인은 수만 표시(토글 시 로그인 유도).
- 데이터: `getBoardPost`/`getBoardPosts`가 `board_post_likes(count)` + 현재 사용자 like 여부.

### 4.4 이미지 첨부 (단계 3)
- 스토리지 버킷 `board-images`(public). storage.objects 정책: INSERT `is_member()`, SELECT anon,
  DELETE 작성자/editor+ (bucket_id='board-images').
- board_post_images RLS: SELECT 공개; INSERT/DELETE는 해당 글 작성자(post.author_user_id = auth.uid())
  또는 `admin_can_edit()`.
- 작성/수정 폼: 이미지 여러 장 선택 업로드 → 서버액션이 버킷 업로드(경로 `postId/uuid.ext`, 사용자
  입력 미포함) + board_post_images 삽입. 서버측 MIME(jpg/png/webp)·용량(5MB) 검증. 삽입 실패 시 업로드
  롤백(고아 방지).
- 상세에서 이미지 표시(순서대로), 삭제 버튼(작성자/기획단). 목록 썸네일은 선택(첫 이미지).

### 4.5 신고 + 검토큐 (단계 4)
- RLS(board_reports): INSERT `TO authenticated WITH CHECK (is_member() AND reporter_user_id =
  auth.uid())` (중복은 UNIQUE로 차단); SELECT/UPDATE `USING (admin_can_edit())` (기획단만).
- 상세/댓글에 "신고" 버튼(회원) → 사유(스팸/욕설/기타) 선택 + 제출. 서버액션 `reportTarget(type, id, reason)`.
  이미 신고했으면 "이미 신고함" 안내.
- `/admin/board-reports`(editor+ 게이트): 신고 목록(대상·사유·신고자수·상태), 각 항목에서 대상 글/댓글
  숨김 처리(기존 setPostHidden/setCommentHidden 재사용) + 신고 상태 변경(resolve/dismiss).
- 사이드바 `AdminSidebar`에 "게시판 신고" 링크(editor+).

## 5. 에러처리 · 검증 · 비범위

- 서버액션 `ActionState`, 친화적 한글. audit_log 기록(board_post_likes는 선택). 게이트: 작성/좋아요/신고
  = requireMember, 모더/큐 = requireEditor.
- 멱등성: 좋아요·신고 UNIQUE 제약이 최종 방어(중복 삽입 위반 → 친화적 메시지).
- 이미지: 서버 MIME/용량 검증, 경로 uuid, 삽입 실패 시 스토리지 롤백.
- 검색: `.or` 이스케이프 or 파라미터화 2-쿼리(인젝션 방지) — **필수**.
- 검증: 각 단계 `npm run build`+`lint`, 라이브 감사(정책·버킷·제약), 수동(필터/검색/좋아요/이미지/신고 큐).
- 마이그레이션: 단계별 CLI `supabase db push`, 사용자 승인 후.

### 비범위 (이후)
대댓글, 인기글/좋아요순 정렬, 이미지 본문 인라인(마크다운 렌더러), 신고 자동 임계치 숨김, 알림,
전문검색(tsvector/pg_trgm), 다국어(/en), 게시 rate-limit(별도 후속).
