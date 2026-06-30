# 회의록 시스템 (Meeting Minutes System) — 설계 문서

- **작성일**: 2026-06-30
- **대상 프로젝트**: pine-nut (`website/`)
- **상태**: 설계 확정, 구현 계획 작성 예정

## 1. 배경 / 목적

풍천리 연대 음악행동 기획팀의 회의록을 관리자 시스템 안에서 작성·보관·열람한다. 현재
`docs/music-action/`에 마크다운으로 정리된 회의록을 구조화된 데이터로 옮겨, 앞으로 회의록이
누적되어도 관리자 UI에서 일관되게 관리한다.

참조 시스템:
- **peace** (`~/peace`) — 회의록 데이터 모델·UX 흐름의 1차 참조. 단 Pages Router + 역할
  기반 권한이라 코드는 직접 이식하지 않고 **데이터 모델·흐름만 차용**한다.
- **ggac** (`~/ggac`) — 이사회 거버넌스(일정투표·정족수·의결)는 우리 범위 밖이므로 제외.

장기적으로 peace 관리자 시스템 대부분을 이식할 계획이나(이메일 시스템 제외), **본 문서는
회의록 시스템 v1에 한정**한다.

## 2. 범위 (확정 사항)

- 데이터 구조: **완전 구조화** (meetings + 하위 5개 관련 테이블)
- 공개 범위: **관리자 전용 (내부)** — 외부 공개 페이지 없음
- 첨부파일: **v1 포함** (Supabase Storage 비공개 버킷 + 서명 URL)
- 시드: **6/29 회의록을 첫 데이터로 삽입**, docs 마크다운은 아카이브로 유지
- 인증: **기존 단일 권한 유지** (로그인 = 관리자). 역할 분리(viewer/editor/owner)는
  peace의 다른 부분을 이식할 때 함께 도입 — 본 v1 범위 밖.

## 3. 아키텍처

기존 pine-nut 관리자 패턴(App Router + 서버액션 + Supabase + `audit_log` + 소프트삭제)에
그대로 얹는다.

| 구성요소 | 경로 |
|----------|------|
| 목록 페이지 | `src/app/admin/meetings/page.tsx` |
| 생성 페이지 | `src/app/admin/meetings/new/page.tsx` |
| 편집·상세 페이지 | `src/app/admin/meetings/[id]/edit/page.tsx` |
| 서버액션 | `src/lib/actions/meetings.ts` |
| 데이터 페처 | `src/lib/data/meetings.ts` (`getAllMeetings`, `getMeetingById`) |
| 폼 컴포넌트 | `src/components/admin/MeetingForm.tsx` |
| 타입 | `src/lib/data/meetings.ts` 또는 별도 `src/types/meeting.ts` 내 인터페이스 |
| 마이그레이션 | `website/supabase/migrations/<timestamp>_meeting_minutes.sql` |

- 인증: 기존 `getAuthenticatedActionClient()` / `getAuthenticatedActionContext()` 재사용.
  미인증 시 `/admin/login` 자동 리다이렉트.
- 사이드바: `src/components/admin/AdminSidebar.tsx`에 "회의록" 링크 추가.
- Supabase 클라이언트: 기존 `supabase-server.ts`(서버), `supabase-browser.ts`(로그인) 재사용.

## 4. 데이터 모델

peace의 4테이블을 우리 회의록 실제 구성(안건/참석자/결정사항/액션아이템/첨부)에 맞게 확장.

### 4.1 테이블

**`meetings`** (중심 엔티티)
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | `gen_random_uuid()` |
| title | text NOT NULL | 회의명 |
| meeting_no | int NULL | 회차 (예: 1) |
| meeting_date | date NULL | 회의 일자 |
| meeting_time | text NULL | 시간/소요 (예: "약 45분") |
| location | text NULL | 장소 |
| format | text NULL | `online` / `offline` / `hybrid` (CHECK) |
| status | text NOT NULL DEFAULT `'scheduled'` | `scheduled` / `completed` (CHECK) |
| purpose | text NULL | 회의 목적 |
| notes | text NULL | 비고 |
| is_deleted | boolean NOT NULL DEFAULT false | 소프트삭제 |
| created_at | timestamptz NOT NULL DEFAULT now() | |
| updated_at | timestamptz NOT NULL DEFAULT now() | |
| created_by | text NULL | 작성자 이메일 |

**`meeting_attendees`**
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| meeting_id | uuid FK → meetings(id) ON DELETE CASCADE | |
| name | text NOT NULL | 이름 |
| role | text NULL | 역할 (예: "기획") |
| sort_order | int NOT NULL DEFAULT 0 | |

**`meeting_agendas`** (안건 + 논의내용 결합)
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| meeting_id | uuid FK → meetings(id) ON DELETE CASCADE | |
| title | text NOT NULL | 안건 제목 |
| discussion | text NULL | 논의내용 (마크다운) |
| sort_order | int NOT NULL DEFAULT 0 | |

**`meeting_decisions`** (결정사항)
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| meeting_id | uuid FK → meetings(id) ON DELETE CASCADE | |
| content | text NOT NULL | 결정 내용 |
| sort_order | int NOT NULL DEFAULT 0 | |

**`meeting_action_items`** (액션아이템)
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| meeting_id | uuid FK → meetings(id) ON DELETE CASCADE | |
| owner | text NULL | 담당 |
| task | text NOT NULL | 할 일 |
| due_text | text NULL | 기한 (자유 텍스트, 예: "이번 주 내") |
| is_done | boolean NOT NULL DEFAULT false | 완료 여부 |
| sort_order | int NOT NULL DEFAULT 0 | |

**`meeting_attachments`**
| 컬럼 | 타입 | 비고 |
|------|------|------|
| id | uuid PK | |
| meeting_id | uuid FK → meetings(id) ON DELETE CASCADE | |
| file_path | text NOT NULL | Storage 경로 |
| file_name | text NOT NULL | 원본 파일명 |
| file_size | bigint NULL | 바이트 |
| mime_type | text NULL | |
| created_at | timestamptz NOT NULL DEFAULT now() | |

### 4.2 RLS / 인덱스 / 스토리지

- 모든 테이블 RLS 활성화, 정책: `FOR ALL TO authenticated USING (true) WITH CHECK (true)`
  (기존 news/timeline 패턴 동일). 공개 SELECT 정책 없음 → 비로그인 접근 차단.
- 인덱스: 하위 테이블 `meeting_id`, `meetings(status)`, `meetings(meeting_date)`,
  하위 테이블 `(meeting_id, sort_order)`.
- 첨부 스토리지: 비공개 버킷 `meeting-files`. 업로드/다운로드는 서버액션에서 서명 URL로만.
  서버사이드에서 MIME/용량(예: 20MB) 검증.
- `meetings`만 소프트삭제(`is_deleted`). 하위 테이블은 부모 삭제 시 CASCADE.

## 5. UI / 흐름

### 5.1 목록 (`/admin/meetings`)
- 카드/행: 회차·제목·일시·장소·상태 배지(예정/완료)·참석자 수.
- 최신순(meeting_date desc, 그다음 created_at desc) 정렬. `is_deleted = false`만.
- "새 회의록" 버튼, 행 클릭 → 편집 페이지.

### 5.2 생성·편집 폼 (`MeetingForm.tsx`)
한 페이지에서 전체 편집:
- **기본 정보**: 제목, 회차, 날짜, 시간, 장소, 형식, 상태, 목적, 비고.
- **참석자**: 이름 + 역할 동적 행(추가/삭제, ↑↓ 순서).
- **안건**: 안건 제목 + 논의내용(textarea, 마크다운) 동적 행.
- **결정사항**: 내용 동적 행.
- **액션아이템**: 담당 / 할 일 / 기한 / 완료 체크 동적 행.
- **첨부파일**: 파일 업로드, 기존 첨부 목록(다운로드/삭제).

### 5.3 저장 방식
- 폼 전체를 한 번에 서버액션으로 제출.
- 하위 항목(참석자·안건·결정·액션)은 **삭제 후 재삽입(replace)** 방식 —
  peace의 개별 PATCH보다 우리 단일 서버액션 패턴에 적합하고 단순.
- 첨부파일은 파일 처리라 **별도 업로드/삭제 액션**으로 분리.

## 6. 에러처리 / 감사 / 검증

- **에러처리**: 기존 `ActionState`(`null | { error: string }`) 패턴. 검증 실패 시 한글 메시지,
  Supabase 에러는 `friendlyMeetingError()` 매핑.
- **감사 로그**: `meetings` 생성/수정/삭제 시 `logAudit(supabase, "meetings", id, action, ...)`.
  `audit_log`에 `meetings` table_name 사용.
- **버전 히스토리**: `VersionHistoryManager.tsx`의 `meetings` 인지 추가는 **v1 후순위**(선택).
- **revalidate**: `/admin/meetings` 및 상세 경로 `revalidatePath`.

## 7. 시드 데이터 (6/29 회의록)

마이그레이션 SQL 내 `INSERT`로 삽입:
- meetings: "풍천리 연대 음악행동(청와대 앞) 기획 회의 #1", 회차 1, 2026-06-29,
  "약 45분", 형식 online, 상태 completed, 목적/비고 포함.
- attendees: 6명 (경하–기획, 박성율 목사–현장·법리, 자이–섭외, 이준용 감독–영상·촬영,
  곽민–섭외, 장현호–섭외).
- agendas: 6개 (밴드셋 / 일정 / 규모·시간 / 섭외·페이 / 현장운영 / 제목) + 각 논의내용.
- decisions: 8건 (결정 사항 표).
- action_items: 7건 (액션 아이템 표).
- attachments: 없음.

docs/music-action/ 마크다운 회의록은 아카이브로 그대로 유지한다.

## 8. 검증 계획

- `cd website && npm run build` + `npm run lint` 통과.
- 관리자 로그인 → 목록 표시 → 6/29 시드 데이터 정상 노출 확인.
- 새 회의록 생성 / 편집 / 하위 항목 추가·삭제 / 첨부 업로드·다운로드·삭제 수동 확인.
- 마이그레이션 적용: Supabase MCP `apply_migration` 또는 SQL 파일 제공 후 사용자 적용(선택).

## 9. 비범위 (Out of Scope, v1)

- 역할 기반 권한(viewer/editor/owner) — 추후 peace 관리자 이식 시.
- 외부 공개 회의록 페이지.
- 일정 투표·정족수·의결(ggac식 거버넌스).
- 이메일/알림 발송.
- 다국어(/en) 회의록.
