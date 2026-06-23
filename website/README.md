# 풍천리를 지켜주세요 Website

강원도 홍천군 화촌면 풍천리 양수발전소 반대 캠페인 웹사이트입니다. Next.js App Router 기반 공개 사이트와 Supabase 기반 관리자 화면을 함께 운영합니다.

## 실행

모든 명령은 `website/` 디렉터리에서 실행합니다.

```bash
npm run dev
npm run lint
npm run build
```

운영 전 검증 스크립트:

```bash
npm run failclosed:check
npm run imagehosts:check
npm run notfound:check
npm run security:check
```

## 구조

- `src/app/`: 공개 페이지, 영문 `/en` 라우트, 관리자 `/admin` 라우트, API 라우트
- `src/components/`: 공유 UI, 관리자 컴포넌트, 인라인 편집 컴포넌트
- `src/components/home/`: 홈 화면 전용 섹션/모션/보조 UI
- `src/components/petition/`: 서명 화면 전용 성공 상태, 최근 서명, confetti, 편집 컨트롤
- `src/lib/data/`: Supabase 조회와 정적 fallback 데이터 경계
- `src/lib/actions/`: 관리자 저장 server actions
- `src/lib/signatures/`: 공개 서명 API를 호출하는 클라이언트 유틸
- `src/data/`: 개발 fallback seed 데이터
- `scripts/`: 운영 불변조건 검증 스크립트
- `supabase/migrations/`: DB 스키마와 정책 변경 이력

## 운영 불변조건

- production에서 Supabase 설정이 없거나 깨지면 demo 응답으로 fallback하지 않고 실패를 명확히 반환합니다.
- 공개 이미지 호스트는 `src/lib/allowed-image-hosts.json`과 `next.config.ts`의 remote pattern이 일치해야 합니다.
- 서명 API는 개인정보 동의, 만 14세 이상 확인, 중복 방지, rate limit, 이름 마스킹을 유지해야 합니다.
- 관리자 콘텐츠 저장은 audit log와 관련 공개 페이지 revalidation을 함께 수행해야 합니다.
- 모바일 검증은 최소 `375x667`과 `320x568` viewport를 포함합니다.

## 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버/API/관리 작업용입니다. 브라우저에 노출하지 않습니다.

## 배포

Vercel에서 호스팅하며 `main` push가 자동 배포를 트리거합니다. 배포 전에는 최소 `npm run lint`, `npm run build`, 운영 검증 스크립트 4종을 통과시킵니다.
