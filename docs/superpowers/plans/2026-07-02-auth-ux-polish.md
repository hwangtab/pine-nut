# 인증/회원 UX 전면 개선 Implementation Plan

> subagent-driven, 태스크별 리뷰. 기존 공개 회원제 위에 UX 정돈.

**Goal:** 비로그인·일반회원(pending)·viewer·editor·owner 전 상태에서 로그인/가입/이동이 자연스럽게 동작하도록 UX 개선.

## 상태별 목표 동작
- 비로그인: 헤더 로그인/회원가입. /login·/signup 정상.
- 가입 성공: **자동 로그인 → /mypage**.
- 로그인 상태로 /login·/signup 방문: **랜딩(/admin 또는 /mypage)으로 자동 이동**(폼 플래시 없이).
- 일반회원(pending): 헤더 로그아웃만(+홈). /admin 접근 시 /mypage.
- **모든 활성 관리자(owner/editor/viewer)**: 헤더에 "관리자" 링크(viewer 포함). 편집모드(인라인)는 editor+ 유지.
- /mypage: 역할별 명확 안내 + 홈 링크 + (관리자면)관리자 링크 + 로그아웃.

## Global Constraints
- `website/`에서. 커밋 한국어+트레일러. `git add`는 해당 파일만(`-A` 금지; untracked `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 방치).
- 인증 게이트/RLS 의미 변경 금지. `isAdmin`(editor+, 인라인편집용)은 유지, 헤더 관리자 링크는 신규 `isActiveAdmin`(owner/editor/viewer) 사용.
- 검증 `npm run build`+`lint`. 재사용: `getMyAdminMember`(role|null), `getLandingPath`(`@/lib/actions/session`), `createSupabaseBrowserClient`, `createSupabaseServerClient`, `claimAdminAccount`.

## Task 1: isActiveAdmin 컨텍스트 + 헤더 관리자 링크(viewer 포함)
Files: `src/app/layout.tsx`, `src/lib/contexts/admin-edit/types.ts`, `src/lib/contexts/AdminEditContext.tsx`, `src/components/admin/AdminEditShell.tsx`, `src/components/Navigation.tsx`, `src/components/navigation/NavigationAuthLinks.tsx`(+ MobileNavigationMenu prop 경유 시).
- layout: `getMyAdminMember()`를 한 번 호출해 `isActiveAdmin = me != null`, `isAdmin = me?.role==='owner'||me?.role==='editor'` 둘 다 계산(중복 호출 피함). `isActiveAdmin`도 AdminEditShell로 전달.
- 컨텍스트에 `isActiveAdmin: boolean` 추가(기본 false), Shell/Provider 전달(isAdmin/isLoggedIn과 동일 패턴).
- NavigationAuthLinks: 관리자 링크 조건을 `isAdmin` → `isActiveAdmin`으로. Navigation이 `isActiveAdmin`도 넘김.
- 검증: tsc+eslint. 커밋: "헤더 관리자 링크를 활성 관리자(viewer 포함) 기준으로 + isActiveAdmin 컨텍스트".

## Task 2: 공용 로그아웃 헬퍼 + /mypage 정돈
Files: Create `src/components/auth/LogoutButton.tsx`(공용, "use client"); Modify `src/app/mypage/page.tsx`(공용 버튼 사용, 홈 링크·역할 안내 보강), `src/app/mypage/LogoutButton.tsx` 제거(공용으로 대체), `src/components/navigation/NavigationAuthLinks.tsx`(로그아웃을 공용 헬퍼/동일 로직으로).
- 공용 `LogoutButton`: prop `className?`, onClick=`createSupabaseBrowserClient().auth.signOut()` 후 `window.location.href="/"`.
- /mypage: 제목/환영/이메일 + 역할 안내(관리자면 "기획단(역할)" + `/admin` 버튼, 일반회원이면 "일반 회원 · 게시판 준비 중"), "홈으로"(`/`) 링크, 공용 로그아웃 버튼.
- NavigationAuthLinks: 로그아웃을 공용 컴포넌트로 대체(중복 제거) — 단 헤더 스타일 유지(className prop).
- 검증: tsc+eslint. 커밋: "공용 로그아웃 컴포넌트로 통일 + 마이페이지 안내/홈링크 보강".

## Task 3: /login 로그인상태 바운스(플래시 없이)
Files: `src/app/login/page.tsx`.
- 현재 client 페이지. 마운트 시 인증 확인 게이트 추가: `useState(checking=true)`; useEffect에서 `createSupabaseBrowserClient().auth.getUser()` → user 있으면 `getLandingPath()` 호출 후 `router.replace(path)`; 없으면 `checking=false`. `checking` 동안엔 폼 대신 최소 로딩(빈/스피너) 렌더 → 폼 플래시 방지. 기존 로그인 로직(rate-limit 등) 그대로.
- 검증: tsc+eslint. 커밋: "로그인 페이지: 이미 로그인 시 랜딩으로 자동 이동(플래시 방지)".

## Task 4: /signup 자동 로그인 + 로그인상태 바운스
Files: `src/app/signup/page.tsx`.
- 로그인상태 바운스: Task 3과 동일 패턴(마운트 시 getUser→있으면 getLandingPath→replace, checking 게이트).
- 제출을 수동 핸들러로: email/password/loading/error를 useState로. onSubmit → FormData 만들어 `claimAdminAccount(null, fd)` 호출. 결과 `{error}`면 표시. `null`(성공)이면 `createSupabaseBrowserClient().auth.signInWithPassword({email,password})` → 성공 시 `router.push("/mypage"); router.refresh()`(signIn 실패 시 "가입은 됐어요. 로그인해 주세요" 안내 + /login 링크). (useActionState 대신 수동 제어로 성공 후 자동 로그인 연결.)
- 검증: tsc+eslint. 커밋: "회원가입: 성공 시 자동 로그인 후 마이페이지 이동 + 로그인상태 바운스".

## Task 5: 통합 검증 + 머지 + 배포
- `npm run build`+`lint`. 최종 리뷰(전 상태 흐름: 비로그인/가입→자동로그인→mypage/로그인상태 바운스/viewer 헤더링크/일반회원 /admin→mypage/루프 없음). main FF 머지 + push.

## Self-Review
- 감사 문제 6건 대응: 가입성공(T4), 로그인상태 재방문(T3·T4), viewer 링크(T1), /mypage 정돈(T2), 로그아웃 중복(T2), /admin 접근 안내는 범위 밖(경미, 생략).
- isAdmin(editor+, 편집) vs isActiveAdmin(관리자 링크) 분리로 viewer 편집권 없음 유지.
- 바운스는 client getUser + checking 게이트로 플래시 방지. 루프 위험 없음(/login·/signup은 /admin 밖).
