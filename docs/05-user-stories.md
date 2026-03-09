# Backlog: 풍천리 웹사이트 - Phase 1

**Format**: User Stories
**Total stories**: 15
**Sprint 기준**: 1 sprint = 1주 (자원봉사 팀 기준)

---

## Epic 1: 스토리텔링 랜딩 페이지

### Story 1: 히어로 섹션
**As a** 첫 방문자, **I want** 페이지를 열자마자 풍천리가 어떤 곳이고 무슨 일이 일어나고 있는지 한눈에 파악하고 싶다, **so that** 더 알아볼지 빠르게 판단할 수 있다.

Acceptance Criteria:
- [ ] 풍천리 전경 사진 또는 주민 사진이 풀스크린 히어로 이미지로 표시된다
- [ ] 핵심 숫자 3개(7년, 680+회, 70대 이상 주민)가 애니메이션 카운터로 표시된다
- [ ] "풍천리 이야기 보기" CTA 버튼이 있고, 클릭 시 스크롤 다운된다
- [ ] 모바일에서 히어로 이미지가 잘리지 않고 텍스트가 읽힌다 (18px+)
- [ ] 페이지 로드 시간 3초 이내 (이미지 최적화, next/image 사용)

Priority: P0 | Effort: M | Dependencies: 히어로 사진 콘텐츠 확보

---

### Story 2: 스크롤 스토리텔링 본문
**As a** 방문자, **I want** 스크롤하면서 풍천리 주민들의 이야기를 자연스럽게 읽고 싶다, **so that** 7년간의 투쟁 맥락을 감정적으로 이해할 수 있다.

Acceptance Criteria:
- [ ] 5~7개 섹션으로 구성: 마을 소개 → 양수발전소란 → 예상 피해 → 주민 반대 시작 → 투쟁 과정 → 현재 상황 → 함께해주세요
- [ ] 각 섹션에 사진 또는 일러스트 1개 이상 포함
- [ ] 스크롤 시 섹션 간 자연스러운 전환 (fade-in 또는 parallax)
- [ ] 마지막 섹션에서 서명/후원/공유 3개 CTA로 연결
- [ ] Strapi CMS에서 각 섹션 텍스트·이미지 수정 가능

Priority: P0 | Effort: L | Dependencies: Story 1, 콘텐츠 원고

---

## Epic 2: 인터랙티브 타임라인

### Story 3: 타임라인 페이지
**As a** 방문자, **I want** 2019년부터 현재까지의 주요 사건을 시간순으로 보고 싶다, **so that** 투쟁의 전체 흐름을 파악할 수 있다.

Acceptance Criteria:
- [ ] 세로 타임라인 UI로 최소 15개 이벤트 표시
- [ ] 각 이벤트: 날짜, 제목, 설명(2~3문장), 사진(선택)
- [ ] 연도별 필터/점프 기능 (2019, 2020, ... 2026)
- [ ] 모바일에서 세로 스크롤로 자연스럽게 탐색 가능
- [ ] Strapi CMS에서 이벤트 추가/수정/삭제 가능

Priority: P0 | Effort: M | Dependencies: 타임라인 콘텐츠 데이터

---

## Epic 3: 온라인 서명 시스템

### Story 4: 서명 폼
**As a** 지지자, **I want** 이름과 이메일만으로 간단하게 서명하고 싶다, **so that** 번거롭지 않게 연대를 표현할 수 있다.

Acceptance Criteria:
- [ ] 입력 필드: 이름(필수), 이메일(필수), 한마디 응원 메시지(선택, 100자 제한)
- [ ] 개인정보 수집·이용 동의 체크박스 + 처리방침 링크
- [ ] 이메일 형식 검증, 중복 서명 방지 (같은 이메일)
- [ ] 제출 후 "감사합니다, OOO님! N번째 서명입니다" 확인 메시지
- [ ] Supabase DB에 서명 데이터 저장, RLS 적용

Priority: P0 | Effort: M | Dependencies: 개인정보 처리방침 확정 (T2)

---

### Story 5: 서명 현황 표시
**As a** 방문자, **I want** 현재까지 몇 명이 서명했는지 실시간으로 보고 싶다, **so that** 많은 사람이 함께하고 있다는 연대감을 느낄 수 있다.

Acceptance Criteria:
- [ ] 서명 페이지 상단에 총 서명 수 실시간 표시 (카운터 애니메이션)
- [ ] 최근 응원 메시지 5개를 익명 처리(이름 일부 마스킹)하여 롤링 표시
- [ ] 서명 수는 Supabase count 쿼리로 실시간 반영 (또는 1분 캐시)
- [ ] 랜딩 페이지에도 서명 수 위젯으로 표시

Priority: P0 | Effort: S | Dependencies: Story 4

---

## Epic 4: 후원 페이지

### Story 6: 후원 안내 페이지
**As a** 지지자, **I want** 후원 방법을 명확하게 알고 싶다, **so that** 신뢰를 갖고 후원금을 보낼 수 있다.

Acceptance Criteria:
- [ ] 계좌이체 정보 표시 (은행명, 계좌번호, 예금주), 복사 버튼
- [ ] 후원금 사용처 안내 (투쟁 활동비, 교통비, 법률 비용 등)
- [ ] 후원 내역 투명 공개 섹션 (월별 수입/지출 요약 테이블)
- [ ] CMS에서 계좌 정보 및 내역 업데이트 가능
- [ ] 간편결제(토스페이/카카오페이) 연동은 Phase 2로 명시, "준비 중" 표시

Priority: P0 | Effort: S | Dependencies: 후원 계좌 확정 (T3)

---

## Epic 5: 소식/뉴스 게시판

### Story 7: 뉴스 목록 페이지
**As a** 방문자, **I want** 최신 소식을 날짜순으로 확인하고 싶다, **so that** 풍천리의 현재 상황을 파악할 수 있다.

Acceptance Criteria:
- [ ] 게시물 카드: 썸네일, 제목, 요약(2줄), 날짜, 카테고리 태그
- [ ] 최신순 기본 정렬, 카테고리 필터 (공지, 집회, 언론보도, 연대)
- [ ] 페이지네이션 (10개씩) 또는 무한 스크롤
- [ ] Strapi CMS에서 게시물 CRUD 가능 (리치 텍스트 에디터)
- [ ] 게시물 없을 때 "아직 소식이 없습니다" 빈 상태 표시

Priority: P0 | Effort: M | Dependencies: 없음

---

### Story 8: 뉴스 상세 페이지
**As a** 방문자, **I want** 개별 소식을 읽고 SNS에 공유하고 싶다, **so that** 주변에 이슈를 알릴 수 있다.

Acceptance Criteria:
- [ ] 리치 텍스트 본문 (이미지, 링크, 볼드/이탤릭 지원)
- [ ] 상단에 제목, 날짜, 카테고리
- [ ] 하단에 SNS 공유 버튼 (카카오톡, 트위터, 페이스북)
- [ ] 이전/다음 게시물 네비게이션
- [ ] SEO: 개별 메타 태그, OG 이미지 자동 생성

Priority: P0 | Effort: S | Dependencies: Story 7

---

## Epic 6: 자료실 / 프레스킷

### Story 9: 프레스킷 페이지
**As a** 기자/활동가, **I want** 보도자료·사진·팩트시트를 한 곳에서 다운로드하고 싶다, **so that** 취재·연대 활동에 바로 활용할 수 있다.

Acceptance Criteria:
- [ ] 섹션 구분: 보도자료, 사진 자료, 팩트시트, 미디어 연락처
- [ ] 보도자료: PDF 다운로드 링크 (날짜별 목록)
- [ ] 사진: 고화질 사진 개별 다운로드 + 전체 ZIP 다운로드
- [ ] 팩트시트: 핵심 수치·쟁점 요약 1페이지 PDF
- [ ] 미디어 연락처: 이메일 + 전화번호 (주민 대표, 연대 활동가)
- [ ] CMS에서 자료 추가/삭제 가능

Priority: P0 | Effort: S | Dependencies: 프레스킷 콘텐츠 제작

---

## Epic 7: SNS 공유 최적화

### Story 10: OG 태그 및 메타데이터
**As a** 방문자, **I want** 웹사이트 링크를 카카오톡에 공유했을 때 미리보기가 깔끔하게 보이길 원한다, **so that** 받는 사람이 클릭해볼 마음이 생긴다.

Acceptance Criteria:
- [ ] 모든 페이지에 og:title, og:description, og:image 태그 설정
- [ ] 카카오톡 공유 시 커스텀 썸네일(1200x630px) 표시
- [ ] 트위터 카드(summary_large_image) 설정
- [ ] 뉴스 상세 페이지는 개별 OG 이미지 (게시물 썸네일 사용)
- [ ] 카카오 개발자 콘솔에 도메인 등록

Priority: P0 | Effort: S | Dependencies: 도메인 확보

---

### Story 11: 공유 버튼 컴포넌트
**As a** 방문자, **I want** 각 페이지에서 한 번의 클릭으로 SNS에 공유하고 싶다, **so that** 쉽게 이슈를 알릴 수 있다.

Acceptance Criteria:
- [ ] 공유 버튼: 카카오톡, 트위터, 페이스북, URL 복사
- [ ] 카카오톡: Kakao JS SDK 연동, 커스텀 템플릿 메시지
- [ ] 트위터/페이스북: 공유 URL with 미리 작성된 문구
- [ ] URL 복사: 클릭 시 "복사되었습니다" 토스트 메시지
- [ ] 모바일에서 Web Share API 지원 시 네이티브 공유 시트 표시

Priority: P0 | Effort: S | Dependencies: Story 10

---

## Epic 8: 모바일 퍼스트 & 접근성

### Story 12: 반응형 레이아웃 & 디자인 시스템
**As a** 모바일 사용자, **I want** 스마트폰에서도 모든 콘텐츠를 편하게 읽고 싶다, **so that** 카카오톡에서 링크를 눌러도 바로 이용할 수 있다.

Acceptance Criteria:
- [ ] 모바일(~768px), 태블릿(768~1024px), 데스크톱(1024px~) 3단계 반응형
- [ ] 모바일 기본 폰트 18px 이상, 줄간격 1.6 이상
- [ ] 터치 타겟 최소 44x44px (버튼, 링크)
- [ ] 색상 대비 WCAG AA 기준 충족 (4.5:1 이상)
- [ ] 햄버거 메뉴: 모바일에서 간결한 네비게이션

Priority: P0 | Effort: M | Dependencies: 없음 (다른 모든 Story에 선행)

---

### Story 13: 글로벌 네비게이션
**As a** 방문자, **I want** 어느 페이지에서든 원하는 섹션으로 쉽게 이동하고 싶다, **so that** 길을 잃지 않고 필요한 정보를 찾을 수 있다.

Acceptance Criteria:
- [ ] 데스크톱: 상단 고정 네비게이션 (홈, 이야기, 소식, 함께하기, 자료실)
- [ ] 모바일: 햄버거 메뉴, 열면 풀스크린 오버레이
- [ ] "함께해주세요" 버튼 항상 강조 (primary color)
- [ ] 현재 페이지 표시 (active state)
- [ ] 스크롤 다운 시 네비게이션 축소 (데스크톱)

Priority: P0 | Effort: S | Dependencies: Story 12

---

### Story 14: 푸터
**As a** 방문자, **I want** 페이지 하단에서 연락처와 부가 정보를 확인하고 싶다, **so that** 추가 문의나 법적 정보를 쉽게 찾을 수 있다.

Acceptance Criteria:
- [ ] 연락처 (이메일, 전화번호)
- [ ] 개인정보 처리방침 링크
- [ ] SNS 채널 링크 (있을 경우)
- [ ] "풍천리 주민회" 저작권 표시
- [ ] 뉴스레터 구독 폼 (이메일 입력, Phase 2 연동 전까지는 구독 의향만 수집)

Priority: P0 | Effort: S | Dependencies: 없음

---

## Epic 9: 영문 요약

### Story 15: English Summary 페이지
**As a** 해외 지지자, **I want** 영어로 풍천리 상황을 이해하고 싶다, **so that** 국제적으로 이슈를 알릴 수 있다.

Acceptance Criteria:
- [ ] 단일 페이지: Background, The Struggle, Environmental Impact, How to Help
- [ ] 핵심 수치(7 years, 680+ protests)와 사진 3~5장 포함
- [ ] 서명 페이지로 연결되는 CTA
- [ ] 네비게이션에 "EN" 링크로 접근 가능
- [ ] CMS에서 영문 텍스트 수정 가능

Priority: P0 | Effort: S | Dependencies: 영문 원고 작성

---

## Story Map

```
Must Have (Sprint 1~2)     Should Have (Sprint 3~4)     Nice to Have (Sprint 5~6)
─────────────────────────   ─────────────────────────    ─────────────────────────
S12 반응형 디자인 시스템     S3  타임라인 페이지          S15 영문 요약 페이지
S13 글로벌 네비게이션        S4  서명 폼                  S9  프레스킷 페이지
S14 푸터                    S5  서명 현황 표시
S1  히어로 섹션             S6  후원 안내 페이지
S2  스크롤 스토리텔링        S7  뉴스 목록
S10 OG 태그                 S8  뉴스 상세
S11 공유 버튼
```

---

## Technical Notes

- **CMS 연동**: 모든 콘텐츠(텍스트, 이미지, 타임라인 이벤트, 뉴스)는 Strapi CMS에서 관리. Content Type 설계를 Sprint 1에서 확정
- **이미지 최적화**: next/image 사용, WebP 자동 변환, lazy loading 적용
- **DB 스키마**: Supabase에 `signatures` 테이블 (id, name, email, message, created_at), RLS로 insert만 허용
- **SEO**: Next.js App Router의 metadata API 활용, sitemap.xml 자동 생성
- **배포**: Vercel에 main 브랜치 자동 배포, Preview 배포로 PR 리뷰

---

## Open Questions

| Question | 영향 Story | 해결 시한 |
|----------|-----------|----------|
| Strapi를 셀프 호스팅할 것인가, Strapi Cloud를 쓸 것인가? | 전체 | Sprint 1 시작 전 |
| 카카오 공유 템플릿 승인 절차 소요 시간? | S10, S11 | Sprint 2 |
| 서명 데이터 보관 기한 및 파기 정책? | S4 | Sprint 2 시작 전 |
| 뉴스 초기 콘텐츠 몇 건을 확보할 수 있는가? | S7, S8 | Sprint 3 시작 전 |
