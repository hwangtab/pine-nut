# 회의록 시스템 (Meeting Minutes System) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 시스템 안에 구조화된 회의록(회의 + 참석자/안건/결정/액션아이템/첨부) CRUD를 추가하고, 6/29 음악행동 회의록을 첫 데이터로 시드한다.

**Architecture:** 기존 pine-nut 관리자 패턴(Next.js App Router + 서버액션 + Supabase + `audit_log` + 소프트삭제)에 그대로 얹는다. 메인 회의 정보와 4개 하위 리스트(참석자·안건·결정·액션)는 단일 서버액션이 "삭제 후 재삽입(replace)"으로 저장하고, 첨부파일만 별도 업로드/삭제 액션으로 분리한다. peace의 데이터 모델·UX를 차용하되 코드는 우리 패턴으로 새로 작성한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript(strict), Supabase(@supabase/ssr), Tailwind CSS v4, lucide-react 아이콘.

## Global Constraints

- 모든 명령은 `website/` 디렉터리에서 실행한다.
- **PK는 `BIGINT GENERATED ALWAYS AS IDENTITY`** 를 쓴다(설계의 UUID 대신). 이유: `audit_log.record_id`가 `BIGINT NOT NULL`, `logAudit(recordId: number)`이므로 UUID는 감사로그·히스토리와 호환되지 않는다.
- 서버액션 반환 타입은 `ActionState = { error: string } | null` (`@/lib/actions/state`).
- 인증은 기존 `getAuthenticatedActionClient()` / `getAuthenticatedActionContext()` (`@/lib/actions/auth`)만 사용. 로그인=관리자, 미인증 시 `/admin/login` 리다이렉트.
- 감사 로그는 `logAudit(supabase, "meetings", id, action, { entityKey, payload })` (`@/lib/actions/audit`). action은 `"create" | "update" | "delete" | "restore"`만 사용.
- RLS 정책은 기존 패턴과 동일: 하위·메인 모두 `TO authenticated USING (true) WITH CHECK (true)`. 공개 SELECT 정책 없음(비로그인 접근 차단).
- 첨부 스토리지: 비공개 버킷 `meeting-files`, 서버에서만 서명 URL 생성. 업로드 용량 상한 20MB.
- 색상은 CSS 변수 사용: `--color-admin-bg/surface/text/muted/border`, `--color-forest`, `--color-sky`, `--color-danger*`. 하드코딩 금지.
- 이 프로젝트엔 단위 테스트 인프라가 없다. 각 태스크의 검증은 `npm run build`(타입체크 포함) + `npm run lint` 통과를 기준으로 하고, 최종 태스크에서 마이그레이션 적용 + 관리자 UI 수동 확인을 한다.
- 커밋 메시지는 한국어, "변경 요약 + 영향 범위" 패턴. 끝에 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` 추가.
- 현재 `main` 브랜치 작업 트리에 무관한 website 변경이 다수 있다. 각 커밋은 **이 기능에 해당하는 파일만 명시적으로 `git add`** 한다(`git add -A` 금지).

## File Structure

생성:
- `website/supabase/migrations/20260630000001_meeting_minutes.sql` — 6개 테이블 + RLS + 인덱스 + 스토리지 버킷
- `website/supabase/migrations/20260630000002_meeting_minutes_seed.sql` — 6/29 회의록 시드
- `website/src/lib/data/meetings.ts` — 타입 + 데이터 페처(`getAllMeetings`, `getMeetingById`)
- `website/src/lib/actions/meetings.ts` — 메인 CRUD 서버액션(하위 항목 replace 포함)
- `website/src/lib/actions/meeting-attachments.ts` — 첨부 업로드/삭제/서명URL 서버액션
- `website/src/components/admin/MeetingForm.tsx` — 통합 편집 폼(동적 행 + 첨부)
- `website/src/app/admin/meetings/page.tsx` — 목록
- `website/src/app/admin/meetings/MeetingListActions.tsx` — 목록 행 액션(편집/삭제/복원)
- `website/src/app/admin/meetings/new/page.tsx` — 생성
- `website/src/app/admin/meetings/[id]/edit/page.tsx` — 편집

수정:
- `website/src/components/admin/AdminSidebar.tsx` — "회의록" nav 항목 추가

---

### Task 1: 스키마 마이그레이션 (6개 테이블 + RLS + 인덱스 + 스토리지 버킷)

**Files:**
- Create: `website/supabase/migrations/20260630000001_meeting_minutes.sql`

**Interfaces:**
- Produces: 테이블 `meetings`, `meeting_attendees`, `meeting_agendas`, `meeting_decisions`, `meeting_action_items`, `meeting_attachments`. 모든 컬럼명은 이후 태스크의 SQL/타입과 정확히 일치해야 한다(아래 정의가 기준).

- [ ] **Step 1: 마이그레이션 SQL 작성**

`website/supabase/migrations/20260630000001_meeting_minutes.sql`:

```sql
-- ==================== MEETINGS (회의록) ====================
CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_no INT,
  meeting_date DATE,
  meeting_time TEXT,
  location TEXT,
  format TEXT CHECK (format IN ('online', 'offline', 'hybrid')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
  purpose TEXT,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS meeting_attendees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_agendas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discussion TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_decisions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_action_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  owner TEXT,
  task TEXT NOT NULL,
  due_text TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_attachments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_meetings_status ON meetings (status);
CREATE INDEX idx_meetings_date ON meetings (meeting_date DESC);
CREATE INDEX idx_meeting_attendees_mid ON meeting_attendees (meeting_id, sort_order);
CREATE INDEX idx_meeting_agendas_mid ON meeting_agendas (meeting_id, sort_order);
CREATE INDEX idx_meeting_decisions_mid ON meeting_decisions (meeting_id, sort_order);
CREATE INDEX idx_meeting_action_items_mid ON meeting_action_items (meeting_id, sort_order);
CREATE INDEX idx_meeting_attachments_mid ON meeting_attachments (meeting_id);

-- ==================== RLS (authenticated full access) ====================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_auth_all" ON meetings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_attendees_auth_all" ON meeting_attendees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_agendas_auth_all" ON meeting_agendas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_decisions_auth_all" ON meeting_decisions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_action_items_auth_all" ON meeting_action_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_attachments_auth_all" ON meeting_attachments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==================== STORAGE: meeting-files (private) ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-files', 'meeting-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "meeting_files_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meeting-files');
CREATE POLICY "meeting_files_auth_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'meeting-files');
CREATE POLICY "meeting_files_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'meeting-files');
```

- [ ] **Step 2: SQL 문법 점검 (로컬, DB 적용 전)**

Run: `cd website && grep -c "CREATE TABLE" supabase/migrations/20260630000001_meeting_minutes.sql`
Expected: `6`

(실제 DB 적용은 Task 9에서 일괄 수행한다. 여기서는 파일 작성·문법 구조만 확정.)

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/supabase/migrations/20260630000001_meeting_minutes.sql
git commit -m "회의록 스키마 마이그레이션 추가: meetings 외 5개 테이블 + RLS + meeting-files 버킷

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 시드 마이그레이션 (6/29 회의록)

**Files:**
- Create: `website/supabase/migrations/20260630000002_meeting_minutes_seed.sql`

**Interfaces:**
- Consumes: Task 1의 테이블 6개.
- Produces: `meetings` 1행 + 하위행(참석자 6, 안건 6, 결정 8, 액션 7).

- [ ] **Step 1: 시드 SQL 작성**

`website/supabase/migrations/20260630000002_meeting_minutes_seed.sql`:

```sql
-- 6/29 음악행동 기획 회의 #1 시드
DO $$
DECLARE
  mid BIGINT;
BEGIN
  INSERT INTO meetings (title, meeting_no, meeting_date, meeting_time, location, format, status, purpose, notes, created_by)
  VALUES (
    '풍천리 연대 음악행동(청와대 앞) 기획 회의 #1',
    1,
    '2026-06-29',
    '약 45분 진행',
    NULL,
    'online',
    'completed',
    '풍천리 상황을 알리는 청와대 앞 음악 축제·문화행동(긴급행동) 기획 논의',
    E'본 행사는 1회성이 아니라 이후 홍천 군청·한전 인근 등 연속 행동으로 이어가는 방향을 염두에 둠.\n비 예보 시 야외 공연·촬영(감전 위험) 어려움 → 우천 시 일정 조정 가능성 상존.',
    'contact@kosmart.org'
  )
  RETURNING id INTO mid;

  INSERT INTO meeting_attendees (meeting_id, name, role, sort_order) VALUES
    (mid, '경하', '기획', 0),
    (mid, '박성율 목사', '현장·법리(집회 신고, 책임), 풍천리 현지 대응', 1),
    (mid, '자이', '뮤지션 섭외, 일정·여건 검토', 2),
    (mid, '이준용 감독', '영상·촬영(보도용 사진 포함)', 3),
    (mid, '곽민', '메탈/밴드 등 뮤지션 섭외', 4),
    (mid, '장현호', '뮤지션 섭외', 5);

  INSERT INTO meeting_agendas (meeting_id, title, discussion, sort_order) VALUES
    (mid, '밴드셋 구축 여부 (핵심 쟁점)', E'효과적으로 "소음"을 내어 풍천리 상황을 알리려면 밴드셋(드럼 포함) 구축이 필요하다는 문제의식.\n- 박성율 목사: 경찰(종로서)은 밴드/어쿠스틱 구분이 아니라 전체 소음(데시벨) 허용 여부로 판단. 밴드 유무가 핵심 변수가 아니라 음악회 자체를 허용/협상하는 차원의 문제.\n- 최근 집시법 판례·법 개정으로 사전 신고 미비만으로는 집시법 적용이 어려워 현장 통제도 애매.\n- 단, 청와대 100m 이내 집회 제한 존재 → 사랑채 바깥 라인(약 100m) 기준 진행 가능(과거 사례 있음).\n- 참석자 다수 "밴드가 오면 좋다"는 데 공감. 준비 부하는 크지만 풍천리에 가장 도움 되는 방향으로 판단.', 0),
    (mid, '개최 일정', E'초안 7월 18일 → 장마·예보 불확실성, 섭외·준비 기간(약 3주) 필요.\n7월 25일로 결정. 풍천리 강제집행 우려로 7월 내 시급 진행 필요.', 1),
    (mid, '규모·시간', E'초안 5시간·8팀 → 화제성 위해 7~8시간·15팀 의견도 제기.\n한 팀당 전환·세팅 포함 30분 보장(실연 약 15분) 기준 산정.\n주민 연로 등으로 2박3일 불가, 하루 진행.\n결론: 6시간·최대 12팀(14~20시)으로 수렴.', 2),
    (mid, '섭외·페이', E'"이슈가 명확해 섭외가 잘 될 것"이라는 공감대(강정 사례: 50팀 초과 섭외).\n우선 각자 2팀씩 섭외 후 단계적 확대(과잉 방지).\n페이는 없음(무페이) — 연대 형식. 입장료·펀딩·주민 부담 모두 현실적으로 어려움.\n회의 참석자(출연자)는 섭외 2팀과 별도로 직접 출연.', 3),
    (mid, '현장 운영', E'여름 땡볕 → 천막 필수(관객석 포함), 박성율 목사 윙카(탑차)도 그늘 활용.\n전기: 청와대 인근은 발전차·발전기 필요 가능성.\n식사: 밥차/도시락 검토(집밥(통영 김주희), 밥연대/밥통(박민선 목사) 등). 커피차 가능성.\n집회 신고: 인원 규모(5천~1만 명 시 전 차선 통제)에 따라 차선 통제 범위 결정. 사랑채 쪽 주민 거주 없음.', 4),
    (mid, '행사 제목', E'후보: "베어지기 전에, 풍천리"(가제), "청와대의 사람의 숲", "풍천리 사람의 숲" 등.\n"사람의 숲"은 좋으나 풍천리 인지가 어려울 수 있어 풍천리 명시 필요. 섭외 전 제목 확정 필요.', 5);

  INSERT INTO meeting_decisions (meeting_id, content, sort_order) VALUES
    (mid, '밴드셋을 구축하여 진행(밴드·어쿠스틱·MR·DJ 모두 수용). 소음·충돌 리스크는 감수, 주최 책임은 박성율 목사가 짐', 0),
    (mid, '개최일 7월 25일(토)로 확정 — 18일은 준비 기간 부족으로 변경', 1),
    (mid, '규모 최대 12팀 / 6시간(14:00~20:00)', 2),
    (mid, '천막 전면 설치(관객석 포함), 소음은 신경 쓰지 않고 진행', 3),
    (mid, '페이 없음(연대 형식)', 4),
    (mid, '섭외는 우선 참석자별 2팀씩, 참석자 본인은 별도 출연', 5),
    (mid, '밥차/도시락 등 식사 제공 추진', 6),
    (mid, '제목은 미확정 — 풍천리 명시 전제로 추가 제안 받아 확정', 7);

  INSERT INTO meeting_action_items (meeting_id, owner, task, due_text, is_done, sort_order) VALUES
    (mid, '경하', '기획안·내용 문서화, 문자(섭외 안내) 양식 정리, 웹사이트 정비 → 공유', '6/30(내일)까지', false, 0),
    (mid, '경하', '확정 날짜(7/25) 및 제목 기획안에 반영', '내일까지', false, 1),
    (mid, '전원', '공연 제목 제안', '내일 정오 전', false, 2),
    (mid, '곽민·장현호', '각 2팀 섭외(밴드/DJ 등 무방)', '이번 주 내', false, 3),
    (mid, '자이', '함께했던 뮤지션 친구들 섭외', '이번 주 내', false, 4),
    (mid, '전원', '각자 2팀씩 우선 섭외 후 추가 섭외 논의', '이번 주 내', false, 5),
    (mid, '전체', '차기 회의(약 1회 더 예정), 잔여 논의는 단톡방에서 진행', '추후', false, 6);
END $$;
```

- [ ] **Step 2: 행 수 점검**

Run: `cd website && grep -c "(mid," supabase/migrations/20260630000002_meeting_minutes_seed.sql`
Expected: `27` (참석자 6 + 안건 6 + 결정 8 + 액션 7 = 27)

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/supabase/migrations/20260630000002_meeting_minutes_seed.sql
git commit -m "회의록 시드 마이그레이션 추가: 6/29 음악행동 기획 회의 #1

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 타입 + 데이터 페처 (`src/lib/data/meetings.ts`)

**Files:**
- Create: `website/src/lib/data/meetings.ts`

**Interfaces:**
- Consumes: Task 1 테이블, `createSupabaseServerClient` (`@/lib/supabase-server`).
- Produces:
  - 타입 `Meeting`, `MeetingAttendee`, `MeetingAgenda`, `MeetingDecision`, `MeetingActionItem`, `MeetingAttachment`, `MeetingDetail`, `MeetingListItem`.
  - `getAllMeetings(): Promise<MeetingListItem[]>`
  - `getMeetingById(id: number): Promise<MeetingDetail | null>`

- [ ] **Step 1: 파일 작성**

`website/src/lib/data/meetings.ts`:

```ts
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface Meeting {
  id: number;
  title: string;
  meetingNo: number | null;
  meetingDate: string | null;
  meetingTime: string | null;
  location: string | null;
  format: "online" | "offline" | "hybrid" | null;
  status: "scheduled" | "completed";
  purpose: string | null;
  notes: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingAttendee { id: number; name: string; role: string | null; sortOrder: number; }
export interface MeetingAgenda { id: number; title: string; discussion: string | null; sortOrder: number; }
export interface MeetingDecision { id: number; content: string; sortOrder: number; }
export interface MeetingActionItem {
  id: number; owner: string | null; task: string; dueText: string | null; isDone: boolean; sortOrder: number;
}
export interface MeetingAttachment {
  id: number; filePath: string; fileName: string; fileSize: number | null; mimeType: string | null; createdAt: string;
}

export interface MeetingDetail extends Meeting {
  attendees: MeetingAttendee[];
  agendas: MeetingAgenda[];
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  attachments: MeetingAttachment[];
}

export interface MeetingListItem extends Meeting {
  attendeeCount: number;
}

interface MeetingRow {
  id: number; title: string; meeting_no: number | null; meeting_date: string | null;
  meeting_time: string | null; location: string | null;
  format: "online" | "offline" | "hybrid" | null; status: "scheduled" | "completed";
  purpose: string | null; notes: string | null; is_deleted: boolean;
  created_at: string; updated_at: string;
}

function rowToMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id, title: row.title, meetingNo: row.meeting_no, meetingDate: row.meeting_date,
    meetingTime: row.meeting_time, location: row.location, format: row.format, status: row.status,
    purpose: row.purpose, notes: row.notes, isDeleted: row.is_deleted,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function getAllMeetings(): Promise<MeetingListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("meetings")
    .select("*, meeting_attendees(count)")
    .eq("is_deleted", false)
    .order("meeting_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch meetings:", error);
    return [];
  }

  return data.map((row: MeetingRow & { meeting_attendees: { count: number }[] }) => ({
    ...rowToMeeting(row),
    attendeeCount: row.meeting_attendees?.[0]?.count ?? 0,
  }));
}

export async function getMeetingById(id: number): Promise<MeetingDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("meetings")
    .select(`*,
      meeting_attendees(id, name, role, sort_order),
      meeting_agendas(id, title, discussion, sort_order),
      meeting_decisions(id, content, sort_order),
      meeting_action_items(id, owner, task, due_text, is_done, sort_order),
      meeting_attachments(id, file_path, file_name, file_size, mime_type, created_at)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch meeting ${id}:`, error);
    return null;
  }
  if (!data) return null;

  const sortByOrder = <T extends { sort_order: number }>(arr: T[] = []) =>
    [...arr].sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...rowToMeeting(data),
    attendees: sortByOrder(data.meeting_attendees).map((a) => ({
      id: a.id, name: a.name, role: a.role, sortOrder: a.sort_order,
    })),
    agendas: sortByOrder(data.meeting_agendas).map((a) => ({
      id: a.id, title: a.title, discussion: a.discussion, sortOrder: a.sort_order,
    })),
    decisions: sortByOrder(data.meeting_decisions).map((d) => ({
      id: d.id, content: d.content, sortOrder: d.sort_order,
    })),
    actionItems: sortByOrder(data.meeting_action_items).map((it) => ({
      id: it.id, owner: it.owner, task: it.task, dueText: it.due_text, isDone: it.is_done, sortOrder: it.sort_order,
    })),
    attachments: (data.meeting_attachments ?? [])
      .sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at))
      .map((f: { id: number; file_path: string; file_name: string; file_size: number | null; mime_type: string | null; created_at: string }) => ({
        id: f.id, filePath: f.file_path, fileName: f.file_name, fileSize: f.file_size, mimeType: f.mime_type, createdAt: f.created_at,
      })),
  };
}
```

- [ ] **Step 2: 타입체크**

Run: `cd website && npx tsc --noEmit`
Expected: 오류 없음 (이 파일 관련 에러 0)

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/data/meetings.ts
git commit -m "회의록 데이터 페처 추가: getAllMeetings/getMeetingById + 타입

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 메인 서버액션 (`src/lib/actions/meetings.ts`)

**Files:**
- Create: `website/src/lib/actions/meetings.ts`

**Interfaces:**
- Consumes: `getAuthenticatedActionClient` (`./auth`), `logAudit` (`./audit`), `ActionState` (`./state`), `revalidatePath` (`next/cache`), `redirect` (`next/navigation`).
- Produces:
  - `createMeetingAction(prev: ActionState, formData: FormData): Promise<ActionState>` (redirect on success)
  - `updateMeetingAction(id: number, prev: ActionState, formData: FormData): Promise<ActionState>` (redirect on success)
  - `deleteMeetingAction(id: number): Promise<ActionState>`
  - `restoreMeetingAction(id: number): Promise<ActionState>`
- **FormData 계약** (MeetingForm이 보내는 필드, Task 6이 준수):
  - 텍스트: `title`(필수), `meeting_no`, `meeting_date`, `meeting_time`, `location`, `format`, `status`, `purpose`, `notes`
  - JSON 문자열: `attendees`=`[{name,role}]`, `agendas`=`[{title,discussion}]`, `decisions`=`[{content}]`, `action_items`=`[{owner,task,due_text,is_done}]`

- [ ] **Step 1: 파일 작성**

`website/src/lib/actions/meetings.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedActionClient } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

interface AttendeeInput { name: string; role: string | null; }
interface AgendaInput { title: string; discussion: string | null; }
interface DecisionInput { content: string; }
interface ActionItemInput { owner: string | null; task: string; due_text: string | null; is_done: boolean; }

interface ParsedMeetingForm {
  title: string;
  meeting_no: number | null;
  meeting_date: string | null;
  meeting_time: string | null;
  location: string | null;
  format: string | null;
  status: string;
  purpose: string | null;
  notes: string | null;
  attendees: AttendeeInput[];
  agendas: AgendaInput[];
  decisions: DecisionInput[];
  action_items: ActionItemInput[];
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function parseJsonArray<T>(formData: FormData, key: string): T[] {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function validateMeetingForm(formData: FormData): { data?: ParsedMeetingForm; error?: string } {
  const title = str(formData, "title");
  if (!title) return { error: "회의 제목을 입력해주세요." };

  const status = str(formData, "status") ?? "scheduled";
  if (!["scheduled", "completed"].includes(status)) return { error: "상태 값이 올바르지 않습니다." };

  const format = str(formData, "format");
  if (format && !["online", "offline", "hybrid"].includes(format)) {
    return { error: "회의 형식 값이 올바르지 않습니다." };
  }

  const meetingNoRaw = str(formData, "meeting_no");
  const meetingNo = meetingNoRaw === null ? null : Number.parseInt(meetingNoRaw, 10);
  if (meetingNo !== null && Number.isNaN(meetingNo)) return { error: "회차는 숫자로 입력해주세요." };

  const attendees = parseJsonArray<{ name?: unknown; role?: unknown }>(formData, "attendees")
    .map((a) => ({ name: typeof a.name === "string" ? a.name.trim() : "", role: typeof a.role === "string" && a.role.trim() !== "" ? a.role.trim() : null }))
    .filter((a) => a.name !== "");

  const agendas = parseJsonArray<{ title?: unknown; discussion?: unknown }>(formData, "agendas")
    .map((a) => ({ title: typeof a.title === "string" ? a.title.trim() : "", discussion: typeof a.discussion === "string" && a.discussion.trim() !== "" ? a.discussion.trim() : null }))
    .filter((a) => a.title !== "");

  const decisions = parseJsonArray<{ content?: unknown }>(formData, "decisions")
    .map((d) => ({ content: typeof d.content === "string" ? d.content.trim() : "" }))
    .filter((d) => d.content !== "");

  const action_items = parseJsonArray<{ owner?: unknown; task?: unknown; due_text?: unknown; is_done?: unknown }>(formData, "action_items")
    .map((it) => ({
      owner: typeof it.owner === "string" && it.owner.trim() !== "" ? it.owner.trim() : null,
      task: typeof it.task === "string" ? it.task.trim() : "",
      due_text: typeof it.due_text === "string" && it.due_text.trim() !== "" ? it.due_text.trim() : null,
      is_done: it.is_done === true,
    }))
    .filter((it) => it.task !== "");

  return {
    data: {
      title,
      meeting_no: meetingNo,
      meeting_date: str(formData, "meeting_date"),
      meeting_time: str(formData, "meeting_time"),
      location: str(formData, "location"),
      format,
      status,
      purpose: str(formData, "purpose"),
      notes: str(formData, "notes"),
      attendees, agendas, decisions, action_items,
    },
  };
}

function friendlyMeetingError(message: string): string {
  if (message.includes("violates row-level security")) return "권한이 없습니다. 다시 로그인해주세요.";
  return "회의록 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

async function replaceChildren(
  supabase: SupabaseClient,
  meetingId: number,
  form: ParsedMeetingForm,
): Promise<{ error?: string }> {
  // 기존 하위 항목 삭제 (첨부 제외)
  for (const table of ["meeting_attendees", "meeting_agendas", "meeting_decisions", "meeting_action_items"]) {
    const { error } = await supabase.from(table).delete().eq("meeting_id", meetingId);
    if (error) return { error: friendlyMeetingError(error.message) };
  }

  if (form.attendees.length > 0) {
    const { error } = await supabase.from("meeting_attendees").insert(
      form.attendees.map((a, i) => ({ meeting_id: meetingId, name: a.name, role: a.role, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.agendas.length > 0) {
    const { error } = await supabase.from("meeting_agendas").insert(
      form.agendas.map((a, i) => ({ meeting_id: meetingId, title: a.title, discussion: a.discussion, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.decisions.length > 0) {
    const { error } = await supabase.from("meeting_decisions").insert(
      form.decisions.map((d, i) => ({ meeting_id: meetingId, content: d.content, sort_order: i })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  if (form.action_items.length > 0) {
    const { error } = await supabase.from("meeting_action_items").insert(
      form.action_items.map((it, i) => ({
        meeting_id: meetingId, owner: it.owner, task: it.task, due_text: it.due_text, is_done: it.is_done, sort_order: i,
      })),
    );
    if (error) return { error: friendlyMeetingError(error.message) };
  }
  return {};
}

function revalidateMeetingPaths(id?: number) {
  revalidatePath("/admin/meetings");
  if (id) revalidatePath(`/admin/meetings/${id}/edit`);
}

export async function createMeetingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      title: form.title, meeting_no: form.meeting_no, meeting_date: form.meeting_date,
      meeting_time: form.meeting_time, location: form.location, format: form.format,
      status: form.status, purpose: form.purpose, notes: form.notes,
      created_by: user?.email ?? null,
    })
    .select("id, title")
    .single();

  if (error || !meeting) return { error: friendlyMeetingError(error?.message ?? "") };

  const childResult = await replaceChildren(supabase, meeting.id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", meeting.id, "create", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(meeting.id);
  redirect("/admin/meetings");
}

export async function updateMeetingAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data: form, error: validationError } = validateMeetingForm(formData);
  if (validationError || !form) return { error: validationError ?? "입력값이 올바르지 않습니다." };

  const supabase = await getAuthenticatedActionClient();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .update({
      title: form.title, meeting_no: form.meeting_no, meeting_date: form.meeting_date,
      meeting_time: form.meeting_time, location: form.location, format: form.format,
      status: form.status, purpose: form.purpose, notes: form.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, title")
    .single();

  if (error || !meeting) return { error: friendlyMeetingError(error?.message ?? "") };

  const childResult = await replaceChildren(supabase, id, form);
  if (childResult.error) return { error: childResult.error };

  await logAudit(supabase, "meetings", id, "update", {
    entityKey: meeting.title,
    payload: { after: { ...form } },
  });

  revalidateMeetingPaths(id);
  redirect("/admin/meetings");
}

export async function deleteMeetingAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const { data, error } = await supabase
      .from("meetings").update({ is_deleted: true }).eq("id", id).select("title").single();
    if (error) return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "delete", { entityKey: data?.title ?? undefined });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function restoreMeetingAction(id: number): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();
    const { data, error } = await supabase
      .from("meetings").update({ is_deleted: false }).eq("id", id).select("title").single();
    if (error) return { error: "복원에 실패했습니다. 다시 시도해주세요." };
    await logAudit(supabase, "meetings", id, "restore", { entityKey: data?.title ?? undefined });
    revalidateMeetingPaths(id);
    return null;
  } catch {
    return { error: "복원에 실패했습니다. 다시 시도해주세요." };
  }
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions/meetings.ts`
Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/meetings.ts
git commit -m "회의록 메인 서버액션 추가: create/update/delete/restore + 하위 항목 replace

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 첨부파일 서버액션 (`src/lib/actions/meeting-attachments.ts`)

**Files:**
- Create: `website/src/lib/actions/meeting-attachments.ts`

**Interfaces:**
- Consumes: `getAuthenticatedActionClient` (`./auth`), `logAudit` (`./audit`), `ActionState` (`./state`), `revalidatePath`.
- Produces:
  - `uploadMeetingAttachmentAction(meetingId: number, _prev: ActionState, formData: FormData): Promise<ActionState>` (field `attachment_file`)
  - `deleteMeetingAttachmentAction(attachmentId: number, meetingId: number): Promise<ActionState>`
  - `getMeetingAttachmentUrl(filePath: string): Promise<string | null>` (서명 URL, 60분 유효)

- [ ] **Step 1: 파일 작성**

`website/src/lib/actions/meeting-attachments.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedActionClient } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const BUCKET = "meeting-files";

export async function uploadMeetingAttachmentAction(
  meetingId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("attachment_file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "업로드할 파일을 선택해주세요." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "파일 용량은 20MB 이하만 가능합니다." };
  }

  const supabase = await getAuthenticatedActionClient();

  const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
  const path = `${meetingId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) return { error: "파일 업로드에 실패했습니다. 다시 시도해주세요." };

  const { data, error } = await supabase
    .from("meeting_attachments")
    .insert({
      meeting_id: meetingId,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    // 메타 저장 실패 시 업로드한 파일 정리
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: "첨부 정보 저장에 실패했습니다. 다시 시도해주세요." };
  }

  await logAudit(supabase, "meetings", meetingId, "update", {
    entityKey: file.name,
    payload: { attachment_added: file.name },
  });

  revalidatePath(`/admin/meetings/${meetingId}/edit`);
  return null;
}

export async function deleteMeetingAttachmentAction(
  attachmentId: number,
  meetingId: number,
): Promise<ActionState> {
  try {
    const supabase = await getAuthenticatedActionClient();

    const { data: row } = await supabase
      .from("meeting_attachments").select("file_path, file_name").eq("id", attachmentId).single();

    if (row?.file_path) {
      await supabase.storage.from(BUCKET).remove([row.file_path]);
    }

    const { error } = await supabase.from("meeting_attachments").delete().eq("id", attachmentId);
    if (error) return { error: "첨부 삭제에 실패했습니다. 다시 시도해주세요." };

    await logAudit(supabase, "meetings", meetingId, "update", {
      entityKey: row?.file_name ?? undefined,
      payload: { attachment_removed: row?.file_name ?? null },
    });

    revalidatePath(`/admin/meetings/${meetingId}/edit`);
    return null;
  } catch {
    return { error: "첨부 삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function getMeetingAttachmentUrl(filePath: string): Promise<string | null> {
  const supabase = await getAuthenticatedActionClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60);
  if (error || !data) return null;
  return data.signedUrl;
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/lib/actions/meeting-attachments.ts`
Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/lib/actions/meeting-attachments.ts
git commit -m "회의록 첨부파일 서버액션 추가: 업로드/삭제 + 서명 URL

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 통합 편집 폼 (`src/components/admin/MeetingForm.tsx`)

**Files:**
- Create: `website/src/components/admin/MeetingForm.tsx`

**Interfaces:**
- Consumes: `ActionState` (`@/lib/actions/state`), `MeetingDetail` 타입 형태(`@/lib/data/meetings`), Task 5 첨부 액션(편집 모드에서만).
- Produces: `default export function MeetingForm(props)`:
  - `action: (prev: ActionState, formData: FormData) => Promise<ActionState>`
  - `initialData?: MeetingDetail`
  - `submitLabel: string`
  - `meetingId?: number` (편집 모드: 첨부 섹션 활성화)
- 동적 리스트 상태를 JSON 문자열로 직렬화하여 hidden input(`attendees`/`agendas`/`decisions`/`action_items`)에 넣어 Task 4 FormData 계약을 충족한다.

- [ ] **Step 1: 파일 작성**

`website/src/components/admin/MeetingForm.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Plus } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";
import type { MeetingDetail } from "@/lib/data/meetings";
import MeetingAttachments from "@/app/admin/meetings/MeetingAttachments";

const inputCls =
  "w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none";
const labelCls = "block font-medium text-base text-[var(--color-admin-text)] mb-2";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

interface AttendeeRow { name: string; role: string; }
interface AgendaRow { title: string; discussion: string; }
interface DecisionRow { content: string; }
interface ActionItemRow { owner: string; task: string; due_text: string; is_done: boolean; }

interface MeetingFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: MeetingDetail;
  submitLabel: string;
  meetingId?: number;
}

export default function MeetingForm({ action, initialData, submitLabel, meetingId }: MeetingFormProps) {
  const [state, formAction] = useActionState(action, null);

  const [attendees, setAttendees] = useState<AttendeeRow[]>(
    initialData?.attendees.map((a) => ({ name: a.name, role: a.role ?? "" })) ?? [],
  );
  const [agendas, setAgendas] = useState<AgendaRow[]>(
    initialData?.agendas.map((a) => ({ title: a.title, discussion: a.discussion ?? "" })) ?? [],
  );
  const [decisions, setDecisions] = useState<DecisionRow[]>(
    initialData?.decisions.map((d) => ({ content: d.content })) ?? [],
  );
  const [actionItems, setActionItems] = useState<ActionItemRow[]>(
    initialData?.actionItems.map((it) => ({
      owner: it.owner ?? "", task: it.task, due_text: it.dueText ?? "", is_done: it.isDone,
    })) ?? [],
  );

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base font-medium">
          {state.error}
        </div>
      )}

      {/* ===== 기본 정보 ===== */}
      <section className="space-y-6">
        <div>
          <label htmlFor="title" className={labelCls}>회의 제목 *</label>
          <input id="title" name="title" required defaultValue={initialData?.title} className={inputCls} placeholder="예: 풍천리 연대 음악행동 기획 회의 #2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="meeting_no" className={labelCls}>회차</label>
            <input id="meeting_no" name="meeting_no" type="number" defaultValue={initialData?.meetingNo ?? ""} className={inputCls} placeholder="예: 2" />
          </div>
          <div>
            <label htmlFor="meeting_date" className={labelCls}>날짜</label>
            <input id="meeting_date" name="meeting_date" type="date" defaultValue={initialData?.meetingDate ?? ""} className={inputCls} />
          </div>
          <div>
            <label htmlFor="meeting_time" className={labelCls}>시간/소요</label>
            <input id="meeting_time" name="meeting_time" defaultValue={initialData?.meetingTime ?? ""} className={inputCls} placeholder="예: 14:00~16:00 (약 2시간)" />
          </div>
          <div>
            <label htmlFor="location" className={labelCls}>장소</label>
            <input id="location" name="location" defaultValue={initialData?.location ?? ""} className={inputCls} placeholder="예: 온라인 화상회의" />
          </div>
          <div>
            <label htmlFor="format" className={labelCls}>형식</label>
            <select id="format" name="format" defaultValue={initialData?.format ?? ""} className={`${inputCls} bg-[var(--color-admin-surface)]`}>
              <option value="">-- 선택 --</option>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="hybrid">하이브리드</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelCls}>상태 *</label>
            <select id="status" name="status" defaultValue={initialData?.status ?? "scheduled"} className={`${inputCls} bg-[var(--color-admin-surface)]`}>
              <option value="scheduled">예정</option>
              <option value="completed">완료</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className={labelCls}>목적</label>
          <textarea id="purpose" name="purpose" rows={2} defaultValue={initialData?.purpose ?? ""} className={`${inputCls} resize-y`} placeholder="회의 목적" />
        </div>
        <div>
          <label htmlFor="notes" className={labelCls}>비고</label>
          <textarea id="notes" name="notes" rows={2} defaultValue={initialData?.notes ?? ""} className={`${inputCls} resize-y`} placeholder="추가 메모" />
        </div>
      </section>

      {/* ===== 참석자 ===== */}
      <DynamicSection title="참석자" onAdd={() => setAttendees((p) => [...p, { name: "", role: "" }])}>
        {attendees.map((row, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
            <input value={row.name} onChange={(e) => setAttendees((p) => p.map((r, j) => j === i ? { ...r, name: e.target.value } : r))} className={inputCls} placeholder="이름" />
            <input value={row.role} onChange={(e) => setAttendees((p) => p.map((r, j) => j === i ? { ...r, role: e.target.value } : r))} className={inputCls} placeholder="역할(예: 기획)" />
            <RemoveButton onClick={() => setAttendees((p) => p.filter((_, j) => j !== i))} />
          </div>
        ))}
      </DynamicSection>
      <input type="hidden" name="attendees" value={JSON.stringify(attendees)} />

      {/* ===== 안건 ===== */}
      <DynamicSection title="안건 / 논의내용" onAdd={() => setAgendas((p) => [...p, { title: "", discussion: "" }])}>
        {agendas.map((row, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[var(--color-admin-border)] p-4">
            <div className="flex gap-2 items-start">
              <input value={row.title} onChange={(e) => setAgendas((p) => p.map((r, j) => j === i ? { ...r, title: e.target.value } : r))} className={inputCls} placeholder="안건 제목" />
              <RemoveButton onClick={() => setAgendas((p) => p.filter((_, j) => j !== i))} />
            </div>
            <textarea value={row.discussion} onChange={(e) => setAgendas((p) => p.map((r, j) => j === i ? { ...r, discussion: e.target.value } : r))} rows={4} className={`${inputCls} resize-y`} placeholder="논의내용 (마크다운)" />
          </div>
        ))}
      </DynamicSection>
      <input type="hidden" name="agendas" value={JSON.stringify(agendas)} />

      {/* ===== 결정사항 ===== */}
      <DynamicSection title="결정사항" onAdd={() => setDecisions((p) => [...p, { content: "" }])}>
        {decisions.map((row, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input value={row.content} onChange={(e) => setDecisions((p) => p.map((r, j) => j === i ? { content: e.target.value } : r))} className={inputCls} placeholder="결정 내용" />
            <RemoveButton onClick={() => setDecisions((p) => p.filter((_, j) => j !== i))} />
          </div>
        ))}
      </DynamicSection>
      <input type="hidden" name="decisions" value={JSON.stringify(decisions)} />

      {/* ===== 액션아이템 ===== */}
      <DynamicSection title="액션아이템" onAdd={() => setActionItems((p) => [...p, { owner: "", task: "", due_text: "", is_done: false }])}>
        {actionItems.map((row, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[var(--color-admin-border)] p-4">
            <div className="flex gap-2 items-start">
              <input value={row.owner} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, owner: e.target.value } : r))} className={`${inputCls} sm:max-w-[160px]`} placeholder="담당" />
              <input value={row.task} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, task: e.target.value } : r))} className={inputCls} placeholder="할 일" />
              <RemoveButton onClick={() => setActionItems((p) => p.filter((_, j) => j !== i))} />
            </div>
            <div className="flex gap-3 items-center">
              <input value={row.due_text} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, due_text: e.target.value } : r))} className={`${inputCls} sm:max-w-[220px]`} placeholder="기한(예: 이번 주 내)" />
              <label className="flex items-center gap-2 text-base text-[var(--color-admin-text)]">
                <input type="checkbox" checked={row.is_done} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, is_done: e.target.checked } : r))} className="w-5 h-5" />
                완료
              </label>
            </div>
          </div>
        ))}
      </DynamicSection>
      <input type="hidden" name="action_items" value={JSON.stringify(actionItems)} />

      {/* ===== 첨부파일 (편집 모드에서만) ===== */}
      {meetingId ? (
        <MeetingAttachments meetingId={meetingId} attachments={initialData?.attachments ?? []} />
      ) : (
        <p className="text-sm text-[var(--color-admin-muted)]">첨부파일은 회의록을 먼저 저장한 뒤 추가할 수 있습니다.</p>
      )}

      <div className="pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function DynamicSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">{title}</h2>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-forest)]/10 rounded-lg hover:bg-[var(--color-forest)]/20 transition-colors">
          <Plus size={16} /> 추가
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="삭제" className="shrink-0 p-3 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-xl transition-colors">
      <Trash2 size={20} />
    </button>
  );
}
```

- [ ] **Step 2: 첨부 하위 컴포넌트 작성** (`MeetingForm`이 import하는 `MeetingAttachments`)

`website/src/app/admin/meetings/MeetingAttachments.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Download, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";
import type { MeetingAttachment } from "@/lib/data/meetings";
import {
  uploadMeetingAttachmentAction,
  deleteMeetingAttachmentAction,
  getMeetingAttachmentUrl,
} from "@/lib/actions/meeting-attachments";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-5 py-3 text-base font-bold text-white bg-[var(--color-sky)] hover:bg-[var(--color-forest)] rounded-xl transition-colors disabled:opacity-50">
      {pending ? "업로드 중..." : "업로드"}
    </button>
  );
}

export default function MeetingAttachments({ meetingId, attachments }: { meetingId: number; attachments: MeetingAttachment[] }) {
  const upload = uploadMeetingAttachmentAction.bind(null, meetingId);
  const [state, formAction] = useActionState(upload, null as ActionState);

  async function handleDownload(filePath: string) {
    const url = await getMeetingAttachmentUrl(filePath);
    if (url) window.open(url, "_blank");
  }

  async function handleDelete(id: number) {
    if (!confirm("이 첨부파일을 삭제할까요?")) return;
    await deleteMeetingAttachmentAction(id, meetingId);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-[var(--color-admin-text)]">첨부파일</h2>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-admin-border)] px-4 py-3">
              <span className="min-w-0 truncate text-base text-[var(--color-admin-text)]">{f.fileName}</span>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => handleDownload(f.filePath)} aria-label="다운로드" className="p-2 text-[var(--color-sky)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"><Download size={18} /></button>
                <button type="button" onClick={() => handleDelete(f.id)} aria-label="삭제" className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 별도 form: 메인 폼 안에 중첩되지 않도록 메인 form 바깥에서 렌더된다고 가정하지 않고, 첨부는 자체 form 액션 사용 */}
      <form action={formAction} className="flex flex-col sm:flex-row gap-2 items-start">
        {state?.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
        <input type="file" name="attachment_file" className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-sky)]/10 file:text-[var(--color-sky)]" />
        <UploadButton />
      </form>
      <p className="text-sm text-[var(--color-admin-muted)]">20MB 이하. 업로드 즉시 저장됩니다(본문 저장과 별개).</p>
    </section>
  );
}
```

> **주의(중첩 form 회피):** HTML은 `<form>` 중첩을 허용하지 않는다. `MeetingAttachments`는 자체 `<form>`을 가지므로, `MeetingForm` 메인 `<form>` **안에서 렌더하면 안 된다**. Step 3에서 `MeetingForm`의 첨부 섹션은 메인 `<form>` 바깥(아래)에 배치하도록 구조를 조정한다.

- [ ] **Step 3: MeetingForm에서 첨부를 메인 form 바깥으로 이동**

`MeetingForm.tsx`에서 첨부 렌더 블록을 메인 `</form>` 다음으로 옮긴다. 반환부를 fragment로 감싼다:

```tsx
  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-8">
        {/* ...기존 에러/기본정보/참석자/안건/결정/액션 + 각 hidden input... */}
        <div className="pt-4">
          <SubmitButton label={submitLabel} />
        </div>
      </form>

      {meetingId ? (
        <MeetingAttachments meetingId={meetingId} attachments={initialData?.attachments ?? []} />
      ) : (
        <p className="text-sm text-[var(--color-admin-muted)]">첨부파일은 회의록을 먼저 저장한 뒤 추가할 수 있습니다.</p>
      )}
    </div>
  );
```

(Step 1에서 첨부 블록을 form 안에 넣었던 부분은 제거하고 위 구조로 대체한다.)

- [ ] **Step 4: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/components/admin/MeetingForm.tsx src/app/admin/meetings/MeetingAttachments.tsx`
Expected: 오류 없음

- [ ] **Step 5: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/components/admin/MeetingForm.tsx website/src/app/admin/meetings/MeetingAttachments.tsx
git commit -m "회의록 통합 편집 폼 + 첨부 컴포넌트 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 관리자 라우트 (목록 / 생성 / 편집 / 목록 액션)

**Files:**
- Create: `website/src/app/admin/meetings/page.tsx`
- Create: `website/src/app/admin/meetings/MeetingListActions.tsx`
- Create: `website/src/app/admin/meetings/new/page.tsx`
- Create: `website/src/app/admin/meetings/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `getAllMeetings`, `getMeetingById` (Task 3); `createMeetingAction`, `updateMeetingAction`, `deleteMeetingAction`, `restoreMeetingAction` (Task 4); `MeetingForm` (Task 6).

- [ ] **Step 1: 목록 행 액션 컴포넌트 작성**

`website/src/app/admin/meetings/MeetingListActions.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMeetingAction, restoreMeetingAction } from "@/lib/actions/meetings";

export default function MeetingListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("이 회의록을 삭제할까요? (히스토리에서 복원 가능)")) return;
    startTransition(async () => {
      const res = await deleteMeetingAction(id);
      if (res?.error) setError(res.error);
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const res = await restoreMeetingAction(id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      {!isDeleted && (
        <Link href={`/admin/meetings/${id}/edit`} className="px-4 py-2 text-sm font-semibold text-[var(--color-sky)] bg-[var(--color-sky)]/10 rounded-lg hover:bg-[var(--color-sky)]/20 transition-colors">
          편집
        </Link>
      )}
      {isDeleted ? (
        <button onClick={handleRestore} disabled={pending} className="px-4 py-2 text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-forest)]/10 rounded-lg hover:bg-[var(--color-forest)]/20 transition-colors disabled:opacity-50">복원</button>
      ) : (
        <button onClick={handleDelete} disabled={pending} className="px-4 py-2 text-sm font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg hover:opacity-80 transition-colors disabled:opacity-50">삭제</button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 목록 페이지 작성**

`website/src/app/admin/meetings/page.tsx`:

```tsx
import Link from "next/link";
import { getAllMeetings } from "@/lib/data/meetings";
import MeetingListActions from "./MeetingListActions";

export default async function AdminMeetingsPage() {
  const meetings = await getAllMeetings();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">회의록</h1>
        <Link href="/admin/meetings/new" className="px-6 py-3 bg-[var(--color-forest)] text-white font-bold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors text-base">
          + 새 회의록
        </Link>
      </div>

      {meetings.length === 0 ? (
        <p className="text-[var(--color-admin-muted)] text-center py-20">등록된 회의록이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${m.status === "completed" ? "text-[var(--color-forest)] bg-[var(--color-forest)]/10" : "text-[var(--color-sky)] bg-[var(--color-sky)]/10"}`}>
                    {m.status === "completed" ? "완료" : "예정"}
                  </span>
                  {m.meetingNo != null && (
                    <span className="text-sm font-semibold text-[var(--color-admin-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded">#{m.meetingNo}</span>
                  )}
                </div>
                <h3 className="font-bold text-[var(--color-admin-text)]">{m.title}</h3>
                <p className="text-base text-[var(--color-admin-muted)]">
                  {[m.meetingDate, m.location, `참석 ${m.attendeeCount}명`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <MeetingListActions id={m.id} isDeleted={m.isDeleted} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 생성 페이지 작성**

`website/src/app/admin/meetings/new/page.tsx`:

```tsx
import Link from "next/link";
import MeetingForm from "@/components/admin/MeetingForm";
import { createMeetingAction } from "@/lib/actions/meetings";

export default function NewMeetingPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/meetings" className="text-base text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]">← 회의록 목록</Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-admin-text)]">새 회의록</h1>
      <MeetingForm action={createMeetingAction} submitLabel="회의록 저장" />
    </div>
  );
}
```

- [ ] **Step 4: 편집 페이지 작성**

`website/src/app/admin/meetings/[id]/edit/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingForm from "@/components/admin/MeetingForm";
import { getMeetingById } from "@/lib/data/meetings";
import { updateMeetingAction } from "@/lib/actions/meetings";

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const meeting = await getMeetingById(id);
  if (!meeting) notFound();

  const action = updateMeetingAction.bind(null, id);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/meetings" className="text-base text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]">← 회의록 목록</Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-admin-text)]">회의록 편집</h1>
      <MeetingForm action={action} initialData={meeting} submitLabel="변경사항 저장" meetingId={id} />
    </div>
  );
}
```

- [ ] **Step 5: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/app/admin/meetings`
Expected: 오류 없음

- [ ] **Step 6: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/app/admin/meetings
git commit -m "회의록 관리자 라우트 추가: 목록/생성/편집 + 목록 액션

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: 사이드바 "회의록" 링크 추가

**Files:**
- Modify: `website/src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: 기존 `navItems` 배열, `lucide-react` 아이콘.

- [ ] **Step 1: import에 아이콘 추가**

`AdminSidebar.tsx`의 lucide-react import 블록(현재 `History,`로 끝남)에 `ClipboardList`를 추가:

```tsx
import {
  Home,
  Newspaper,
  Clock,
  Users,
  LogOut,
  Blocks,
  Images,
  History,
  ClipboardList,
} from "lucide-react";
```

- [ ] **Step 2: navItems에 회의록 항목 추가**

`navItems` 배열에서 `히스토리` 항목 다음 줄에 추가:

```tsx
  { href: "/admin/history", label: "히스토리", icon: History },
  { href: "/admin/meetings", label: "회의록", icon: ClipboardList },
  { href: "/admin/news", label: "소식 관리", icon: Newspaper },
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `cd website && npx tsc --noEmit && npx eslint src/components/admin/AdminSidebar.tsx`
Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add website/src/components/admin/AdminSidebar.tsx
git commit -m "관리자 사이드바에 회의록 링크 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: 마이그레이션 적용 + 빌드/린트 + 수동 검증

**Files:** (없음 — 통합 검증)

- [ ] **Step 1: 전체 빌드**

Run: `cd website && npm run build`
Expected: 빌드 성공, `/admin/meetings` 및 `/admin/meetings/new` 라우트가 빌드 출력에 포함.

- [ ] **Step 2: 전체 린트**

Run: `cd website && npm run lint`
Expected: 통과(이 기능 관련 신규 오류 0).

- [ ] **Step 3: 마이그레이션 적용 (Supabase MCP)**

`20260630000001_meeting_minutes.sql`, 이어서 `20260630000002_meeting_minutes_seed.sql` 순서로 `apply_migration` 실행.
적용 후 확인:

```sql
SELECT count(*) FROM meetings;            -- 1
SELECT count(*) FROM meeting_attendees;   -- 6
SELECT count(*) FROM meeting_agendas;     -- 6
SELECT count(*) FROM meeting_decisions;   -- 8
SELECT count(*) FROM meeting_action_items;-- 7
```

(MCP 적용이 불가하면 두 SQL 파일을 사용자에게 전달해 Supabase 대시보드 SQL Editor에서 실행하도록 안내.)

- [ ] **Step 4: 수동 UI 검증 (`npm run dev`)**

확인 항목:
1. `/admin/login`으로 로그인.
2. 사이드바 "회의록" 클릭 → `/admin/meetings`에 6/29 회의록 1건 노출(상태 "완료", #1, 참석 6명).
3. 편집 클릭 → 기본정보·참석자 6·안건 6·결정 8·액션 7이 채워져 있음.
4. 첨부 섹션에서 임의 파일 업로드 → 목록에 표시 → 다운로드(새 탭 열림) → 삭제 동작.
5. "변경사항 저장" → 목록 복귀, 데이터 유지.
6. "새 회의록"으로 신규 1건 생성(참석자·안건 일부 입력) → 목록에 추가됨.
7. 신규 항목 삭제 → 목록에서 사라짐(소프트삭제). `/admin/history`에서 `meetings` 감사 로그 확인.

- [ ] **Step 5: 검증 결과 보고**

빌드/린트 결과와 수동 검증 체크리스트 결과를 사용자에게 보고. 실패 항목이 있으면 해당 태스크로 돌아가 수정.

---

## Self-Review

**Spec coverage:**
- 6테이블 데이터 모델 → Task 1 ✓
- 6/29 시드 → Task 2 ✓
- 데이터 페처 → Task 3 ✓
- CRUD + 하위 replace + 감사로그 → Task 4 ✓
- 첨부(비공개 버킷 + 서명 URL, 20MB) → Task 1(버킷) + Task 5 ✓
- 통합 폼(동적 행) → Task 6 ✓
- 목록/생성/편집 라우트 → Task 7 ✓
- 사이드바 링크 → Task 8 ✓
- 단일 권한 인증(로그인=관리자) → 전 태스크 `getAuthenticatedActionClient` ✓
- 빌드/린트/수동 검증 → Task 9 ✓
- 버전 히스토리 `meetings` 인지: 설계에서 v1 후순위(선택)로 명시 → 의도적 비포함, 감사 로그 자체는 기록됨 ✓

**Placeholder scan:** 모든 코드 단계에 실제 코드 포함. "적절한 에러 처리" 류 모호 표현 없음.

**Type consistency:** `MeetingDetail`/`MeetingAttachment` 등 타입은 Task 3 정의를 Task 6·7에서 동일 명칭으로 소비. FormData 키(`attendees`/`agendas`/`decisions`/`action_items`)는 Task 4 파서와 Task 6 hidden input이 일치. 첨부 액션 시그니처(`uploadMeetingAttachmentAction(meetingId, prev, formData)`, `deleteMeetingAttachmentAction(id, meetingId)`, `getMeetingAttachmentUrl(filePath)`)는 Task 5 정의와 Task 6 소비가 일치.

**알려진 주의점:** Task 6의 중첩 `<form>` 문제는 Step 3에서 명시적으로 해소(첨부를 메인 form 바깥 배치).
