# PRD: 풍천리 관리자 대시보드

---

## 1. Summary

풍천리 캠페인 웹사이트(pungcheonri.vercel.app)의 콘텐츠를 비개발자인 마을 주민이 직접 관리할 수 있도록 하는 관리자 대시보드를 구축한다. 현재 TypeScript 파일에 하드코딩된 뉴스·타임라인 데이터를 Supabase DB로 이관하고, 60~80대 고령 주민도 스마트폰으로 쉽게 사용할 수 있는 관리 화면을 제공한다.

---

## 2. Contacts

| 이름 | 역할 | 비고 |
|------|------|------|
| 개발자 (본인) | 기술 리드 / 유일한 개발자 | 초기 구축 및 기술 지원 |
| 풍천리 주민 대표 | 주 사용자 | 뉴스·타임라인 콘텐츠 관리 |
| 시민단체 활동가 | 보조 사용자 | 콘텐츠 관리 지원 |

---

## 3. Background

### 현재 상황
- 웹사이트는 Next.js 16 + Supabase로 운영 중
- Supabase에는 `signatures` 테이블 1개만 존재 (서명 기능)
- **뉴스 10건**, **타임라인 21건**이 `src/data/news.ts`, `src/data/timeline.ts`에 하드코딩
- 콘텐츠 업데이트 = 코드 수정 + Git 커밋 + Vercel 배포 → **개발자만 가능**

### 왜 지금인가
- 개발자가 웹사이트 관리에서 빠져야 하는 시점
- 주민들의 투쟁이 7년째 진행 중이며 새로운 소식이 지속적으로 발생
- 680회 이상의 집회 기록, 재판 진행 등 업데이트가 빈번함
- 주민들이 자체적으로 콘텐츠를 관리할 수 있어야 캠페인의 지속가능성이 확보됨

### 기술적 기반
- Supabase가 이미 연동되어 있어 테이블 추가와 Auth 도입이 용이
- Next.js App Router의 `/admin` 경로로 자연스럽게 관리 화면 추가 가능

---

## 4. Objective

### 목표
개발자 개입 없이 풍천리 주민이 웹사이트 콘텐츠를 직접 관리할 수 있게 한다.

### 왜 중요한가
- 캠페인의 자립성: 개발자 의존도 제거
- 속보성: 집회·재판 등 긴급 소식을 주민이 즉시 게시 가능
- 지속가능성: 장기 투쟁에 필요한 운영 인프라 확보

### Key Results (OKR)

| KR | 측정 방법 | 목표 |
|----|-----------|------|
| KR1: 주민이 뉴스를 독립적으로 게시 | 도움 없이 뉴스 작성 완료 | 첫 주 내 1건 이상 |
| KR2: 타임라인 이벤트 추가 | 도움 없이 이벤트 등록 | 첫 주 내 1건 이상 |
| KR3: 서명 현황 확인 | 대시보드 접속 후 확인까지 소요 시간 | 30초 이내 |
| KR4: 치명적 오류 없음 | 데이터 유실/사이트 장애 | 0건 |

---

## 5. Market Segment(s)

### Primary: 풍천리 마을 주민
- **연령**: 60~80대
- **기기**: 스마트폰 (Android 위주)
- **IT 능력**: 카카오톡, 네이버 검색 수준
- **Pain Point**: 웹사이트에 새 소식을 올리고 싶어도 개발자에게 매번 부탁해야 함
- **Job**: "우리 마을 이야기를 세상에 알리고 싶다"

### Secondary: 시민단체 활동가
- **연령**: 30~50대
- **기기**: 스마트폰 + PC
- **IT 능력**: 기본 컴퓨터 활용 가능
- **Pain Point**: 연대 활동 소식을 빠르게 공유하고 싶음
- **Job**: "캠페인 소식을 효과적으로 전달하고 싶다"

### 제약 조건
- 교육 시간 최소화 (1회 30분 이내 설명으로 사용 가능해야 함)
- 실수로 데이터를 삭제해도 복구 가능해야 함 (soft delete)
- 인터넷 연결이 불안정할 수 있음 (저장 실패 시 명확한 안내)

---

## 6. Value Proposition(s)

### 해결하는 문제
| 현재 | 대시보드 도입 후 |
|------|-----------------|
| 개발자에게 카톡으로 내용 전달 → 대기 → 배포 | 주민이 직접 작성 → 즉시 게시 |
| 서명 수 확인하려면 개발자에게 문의 | 대시보드에서 실시간 확인 |
| 새 타임라인 이벤트 추가 불가 | 주민이 직접 추가 |
| 오타 수정에도 코드 배포 필요 | 관리 화면에서 즉시 수정 |

### 핵심 가치
1. **자립성**: 기술 지식 없이 콘텐츠 관리
2. **즉시성**: 작성 즉시 웹사이트 반영
3. **안전성**: 실수해도 복구 가능, 삭제 전 확인

---

## 7. Solution

### 7.1 UX / 사용자 흐름

#### 로그인 흐름
```
/admin 접속 → 이메일/비밀번호 입력 → 로그인 → 대시보드 홈
```

#### 대시보드 홈 (한눈에 보기)
```
┌─────────────────────────────┐
│  풍천리 관리자              │
│  ─────────────────────────  │
│  📊 서명 현황    2,847명    │
│  📰 소식         10건      │
│  📅 타임라인     21건      │
│  ─────────────────────────  │
│  [소식 관리]  [타임라인 관리] │
│  [서명 현황]  [로그아웃]     │
└─────────────────────────────┘
```

#### 뉴스 작성 흐름
```
소식 관리 → [새 소식 쓰기] 버튼 → 폼 작성 → [게시하기] → 확인 팝업 → 완료
```

#### 뉴스 수정 흐름
```
소식 관리 → 목록에서 항목 터치 → [수정하기] → 폼 수정 → [저장하기] → 확인 팝업
```

### 7.2 Key Features

#### Feature 1: 인증 시스템
- Supabase Auth 이메일/비밀번호 로그인
- `/admin` 하위 모든 경로에 인증 미들웨어
- 자동 로그아웃: 24시간 후 세션 만료
- 관리자 계정은 Supabase Dashboard에서 수동 생성

#### Feature 2: 소식(뉴스) 관리
- **목록**: 최신순 정렬, 카테고리 필터, 제목+날짜 표시
- **작성**: 제목, 요약, 본문, 날짜, 카테고리(드롭다운), 출처명, 출처URL, 썸네일URL
  - slug 자동 생성 (제목 기반)
  - 본문은 `<textarea>` (마크다운/WYSIWYG 아님, 단순 텍스트)
- **수정**: 작성 폼과 동일, 기존 값 pre-fill
- **삭제**: soft delete (is_deleted 플래그), 확인 다이얼로그 2단계

#### Feature 3: 타임라인 관리
- **목록**: 날짜순 정렬, 연도+제목 표시
- **작성**: 날짜, 연도, 제목, 설명, 카테고리(드롭다운), 이미지URL(선택)
- **수정/삭제**: 뉴스와 동일한 패턴

#### Feature 4: 서명 현황
- 총 서명 수 (큰 숫자)
- 최근 10건 서명 목록 (이름 마스킹 유지)
- 일별 서명 수 간단 바 차트 (최근 14일)

### 7.3 Technology

#### 데이터베이스 (Supabase)

**새 테이블: `news`**
```sql
id BIGINT PRIMARY KEY
title TEXT NOT NULL
summary TEXT
content TEXT
date DATE NOT NULL
category TEXT NOT NULL  -- '공지'|'집회'|'언론보도'|'연대'
slug TEXT UNIQUE NOT NULL
source_url TEXT
source_name TEXT
thumbnail_url TEXT
is_deleted BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**새 테이블: `timeline_events`**
```sql
id BIGINT PRIMARY KEY
date TEXT NOT NULL
year TEXT NOT NULL
title TEXT NOT NULL
description TEXT
category TEXT NOT NULL  -- '회의'|'집회'|'법률'|'연대'|'기타'
image_url TEXT
image_alt TEXT
is_deleted BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### RLS 정책
- 공개 페이지: `SELECT WHERE is_deleted = FALSE` (anon 허용)
- 관리자 페이지: 인증된 사용자만 `INSERT`, `UPDATE`, `DELETE`

#### 프론트엔드 구조
```
src/app/admin/
├── layout.tsx          # 인증 게이트 + 관리자 레이아웃
├── page.tsx            # 대시보드 홈
├── login/page.tsx      # 로그인 페이지
├── news/
│   ├── page.tsx        # 소식 목록
│   ├── new/page.tsx    # 소식 작성
│   └── [id]/page.tsx   # 소식 수정
├── timeline/
│   ├── page.tsx        # 타임라인 목록
│   ├── new/page.tsx    # 이벤트 작성
│   └── [id]/page.tsx   # 이벤트 수정
└── signatures/
    └── page.tsx        # 서명 현황
```

#### 기존 페이지 변경
- `src/app/news/page.tsx`: `news.ts` import → Supabase fetch
- `src/app/news/[slug]/page.tsx`: 동일
- `src/app/timeline/page.tsx`: `timeline.ts` import → Supabase fetch
- `src/lib/supabase.ts`: 서버 컴포넌트용 클라이언트 추가 (service role key 또는 서버사이드 anon)

### 7.4 Assumptions

| 가정 | 검증 방법 |
|------|-----------|
| 주민들이 이메일 계정을 보유하고 있다 | 사전 확인 후 계정 생성 |
| 스마트폰 브라우저에서 관리 가능하다 | 모바일 테스트 |
| 텍스트 입력만으로 충분하다 (이미지 업로드 불필요) | 주민 인터뷰 — 현재 뉴스 이미지는 외부 URL |
| soft delete로 안전망이 충분하다 | 운영 후 평가 |

---

## 8. Release

### Phase 1 — MVP (1주)
- Supabase 테이블 생성 + 기존 데이터 마이그레이션
- 인증 시스템 (로그인/로그아웃)
- 뉴스 CRUD (목록/작성/수정/삭제)
- 기존 뉴스 페이지를 Supabase에서 fetch하도록 전환
- 서명 현황 조회 (카운트 + 최근 목록)

### Phase 2 — 완성 (+3~4일)
- 타임라인 CRUD
- 기존 타임라인 페이지를 Supabase에서 fetch하도록 전환
- 일별 서명 추이 차트
- 대시보드 홈 요약 카드

### Phase 3 — 개선 (운영 후)
- 이미지 업로드 (Supabase Storage) — 주민 요청 시
- 뉴스 본문 리치 텍스트 에디터 — 필요성 확인 후
- 활동 로그 (누가 언제 수정했는지)
- 다중 관리자 권한 분리

### 고려하지 않는 것 (Out of Scope)
- 후원 관리 (외부 링크 유지)
- 카드뉴스 관리 (코드 기반 디자인 유지)
- 영문 페이지 관리
- SEO 메타데이터 관리 (자동 생성)

---

## 부록: UX 가이드라인

### 접근성 기준 (고령 사용자)
- **글꼴 크기**: 본문 최소 16px, 제목 20px 이상
- **버튼**: 최소 48x48px 터치 영역, 명확한 라벨
- **색상 대비**: WCAG AA 이상 (4.5:1)
- **간격**: 요소 간 충분한 여백 (밀집 금지)
- **피드백**: 모든 액션에 즉각적 시각 피드백 (로딩, 성공, 실패)
- **확인**: 삭제·게시 시 "정말 삭제하시겠습니까?" 확인 팝업
- **네비게이션**: 최대 2depth (홈 → 기능), 항상 "뒤로가기" 가능
