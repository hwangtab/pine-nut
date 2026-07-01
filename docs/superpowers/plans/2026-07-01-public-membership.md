# 공개 회원제(회원가입 헤더 노출) Implementation Plan

> 실행: subagent-driven, 태스크별 리뷰.

**Goal:** 인증을 "관리자 전용"에서 "공개 회원제 + 관리자(기획단) 부분집합"으로 확장. 공개 `/signup`·`/login`을 만들고 메인 헤더에 노출, 로그인 후 역할 분기(기획단→/admin, 일반회원→/mypage).

**개념:** 가입=회원(role=pending=일반회원). owner가 역할 부여=기획단(관리자). 하나의 계정 체계(admin_members). 게시판/마이페이지 본기능은 후속.

## Global Constraints
- `website/`에서 실행. 커밋 한국어 + Co-Authored-By 트레일러. `git add`는 해당 파일만(`-A` 금지; 무관 untracked 파일 `website/COMPREHENSIVE_CODE_REVIEW.md`·`.claude/` 건드리지 말 것).
- 기존 관리자 흐름·RLS·게이트 로직 의미 변경 금지. pending=일반회원은 이미 앱/SQL에서 무권한 처리됨.
- 검증: `npm run build` + `npm run lint`(테스트 인프라 없음).
- 기존 로그인 로직(rate-limit 등)은 `/admin/login/page.tsx`에 있음 — /login으로 이전하고 /admin/login은 리다이렉트.
- 재사용: 가입 액션 `claimAdminAccount`(`@/lib/actions/admin-signup`) 그대로(오픈가입→pending). 브라우저 인증 `createSupabaseBrowserClient`(`@/lib/supabase-browser`), 서버 `createSupabaseServerClient`(`@/lib/supabase-server`), 역할 조회 `getMyAdminMember`(`@/lib/data/admin-members`).

## File Structure
생성:
- `src/app/signup/page.tsx` — 공개 회원가입(회원 브랜딩)
- `src/app/login/page.tsx` — 공개 로그인(역할 분기 리다이렉트)
- `src/app/mypage/page.tsx` — 로그인 회원 플레이스홀더(서버, 인증 게이트)
- `src/lib/actions/session.ts` — `getLandingPath()` 서버액션(admin→/admin, else→/mypage)
수정:
- `src/app/admin/login/page.tsx` → `redirect("/login")` 리다이렉트 스텁
- `src/app/admin/signup/page.tsx` → `redirect("/signup")` 리다이렉트 스텁
- `src/proxy.ts` — 미인증 /admin/* 리다이렉트 대상 `/admin/login` → `/login`
- `src/app/layout.tsx` — `isLoggedIn` 계산 추가, AdminEditShell로 전달
- `src/components/admin/AdminEditShell.tsx` + `src/lib/contexts/AdminEditContext.tsx`(+ `admin-edit/types.ts`) — 컨텍스트에 `isLoggedIn` 추가
- `src/components/Navigation.tsx`(+ 필요 시 DesktopNavigation/MobileNavigationMenu) — 인증 링크(로그인/회원가입 ↔ 로그아웃/관리자) 노출

---

### Task 1: 공개 회원가입 `/signup` + /admin/signup 리다이렉트
**Files:** Create `src/app/signup/page.tsx`; Modify `src/app/admin/signup/page.tsx`.
- `/signup`: 기존 `src/app/admin/signup/page.tsx`의 UI/로직을 회원 브랜딩으로 복제(제목 "회원가입", 안내 "가입 후 기획단이 역할을 부여하면 관리자 기능을 쓸 수 있습니다. 일반 회원은 추후 게시판 등을 이용합니다."). `useActionState(claimAdminAccount, null)`, email/password 입력, 성공 시(state===null) 안내+`/login` 링크. 하단에 "이미 계정이 있나요? 로그인" → `/login`.
- `src/app/admin/signup/page.tsx` 전체를 서버 리다이렉트 스텁으로 교체:
```tsx
import { redirect } from "next/navigation";
export default function AdminSignupRedirect() {
  redirect("/signup");
}
```
- 검증: `npx tsc --noEmit && npx eslint src/app/signup/page.tsx src/app/admin/signup/page.tsx`.
- 커밋: "공개 회원가입 페이지 /signup 신설 + /admin/signup 리다이렉트".

### Task 2: 세션 랜딩 액션 + 공개 로그인 `/login` + /admin/login 리다이렉트 + proxy
**Files:** Create `src/lib/actions/session.ts`, `src/app/login/page.tsx`; Modify `src/app/admin/login/page.tsx`, `src/proxy.ts`.
- `src/lib/actions/session.ts`:
```ts
"use server";
import { getMyAdminMember } from "@/lib/data/admin-members";
export async function getLandingPath(): Promise<string> {
  const me = await getMyAdminMember();
  return me ? "/admin" : "/mypage";
}
```
(getMyAdminMember는 owner/editor/viewer만 반환 → 일반회원(pending)=null → /mypage.)
- `src/app/login/page.tsx`: 기존 `src/app/admin/login/page.tsx` 로직(rate-limit, 잠금, signInWithPassword) 복제하되 브랜딩 "로그인", 성공 시 `router.push("/admin")` 대신:
```ts
const path = await getLandingPath();
router.push(path);
router.refresh();
```
하단에 "회원가입" → `/signup` 링크.
- `src/app/admin/login/page.tsx` 전체를 리다이렉트 스텁으로:
```tsx
import { redirect } from "next/navigation";
export default function AdminLoginRedirect() {
  redirect("/login");
}
```
- `src/proxy.ts`: 미인증 /admin/* 리다이렉트 대상을 `/admin/login`에서 `/login`으로 변경(해당 `NextResponse.redirect(new URL("/admin/login", request.url))` → `"/login"`). 로그인 사용자가 공개 로그인/가입 페이지 방문 시 처리(isAdminPublicPage 로직)는 그대로 두되, 그 페이지들이 이제 리다이렉트 스텁이므로 동작에 무해함을 확인. matcher(`/admin/:path*`) 불변.
- 검증: `npx tsc --noEmit && npx eslint src/lib/actions/session.ts src/app/login/page.tsx src/app/admin/login/page.tsx src/proxy.ts`.
- 커밋: "공개 로그인 /login 신설(역할 분기) + /admin/login 리다이렉트 + 미인증 리다이렉트 /login".

### Task 3: 마이페이지 플레이스홀더 `/mypage`
**Files:** Create `src/app/mypage/page.tsx`.
- 서버 컴포넌트. `createSupabaseServerClient()`로 `getUser()`; 없으면 `redirect("/login")`.
- 표시: 인사("환영합니다"), 이메일, 회원 상태("일반 회원 — 게시판 기능 준비 중"). `getMyAdminMember()`가 non-null이면 "기획단 관리자 페이지로" 링크(`/admin`). 로그아웃 버튼(작은 client 컴포넌트나 기존 패턴). CSS 변수 사용.
- 로그아웃: 간단 client 컴포넌트 `src/app/mypage/LogoutButton.tsx`("use client") — `createSupabaseBrowserClient().auth.signOut()` 후 `window.location.href = "/"`.
- 검증: `npx tsc --noEmit && npx eslint src/app/mypage`.
- 커밋: "마이페이지 플레이스홀더 /mypage 추가(로그인 회원용)".

### Task 4: 컨텍스트에 isLoggedIn 추가 + 레이아웃 계산
**Files:** Modify `src/app/layout.tsx`, `src/components/admin/AdminEditShell.tsx`, `src/lib/contexts/AdminEditContext.tsx`, `src/lib/contexts/admin-edit/types.ts`.
- `admin-edit/types.ts`: `AdminEditProviderProps`에 `isLoggedIn: boolean` 추가; 컨텍스트 값 타입(있으면)에 `isLoggedIn` 추가.
- `AdminEditContext.tsx`: `AdminEditProvider({ children, isAdmin, isLoggedIn, initialContent })` — 컨텍스트 기본값에 `isLoggedIn: false`, provider value에 `isLoggedIn` 포함.
- `AdminEditShell.tsx`: prop `isLoggedIn` 받아 `AdminEditProvider`로 전달.
- `layout.tsx`: 기존 `checkIsAdmin()` 옆에 `checkIsLoggedIn()`(`createSupabaseServerClient().auth.getUser()` != null) 추가, `Promise.all`에 포함, `<AdminEditShell isAdmin={isAdmin} isLoggedIn={isLoggedIn} ...>`.
- 검증: `npx tsc --noEmit`.
- 커밋: "인증 컨텍스트에 isLoggedIn 추가 + 레이아웃에서 계산".

### Task 5: 헤더에 인증 링크 노출 (Navigation)
**Files:** Modify `src/components/Navigation.tsx` (+ `navigation/DesktopNavigation.tsx`, `navigation/MobileNavigationMenu.tsx` 필요 시).
- Navigation은 client. `const { getContent, isAdmin, isLoggedIn } = useAdminEdit();`
- 데스크톱·모바일에 인증 영역 추가:
  - `!isLoggedIn`: "로그인"(`/login`) + "회원가입"(`/signup`) 링크.
  - `isLoggedIn`: "로그아웃" 버튼(`createSupabaseBrowserClient().auth.signOut()` 후 `window.location.href="/"`) + `isAdmin`이면 "관리자"(`/admin`) 링크.
- 기존 navLinks/CTA는 유지. 스타일은 기존 헤더 링크 톤(CSS 변수). 모바일 메뉴에도 동일 노출.
- 검증: `npx tsc --noEmit && npx eslint src/components/Navigation.tsx && npm run build`.
- 커밋: "메인 헤더에 로그인/회원가입/로그아웃 노출(역할별 관리자 링크)".

### Task 6: 통합 검증 + 머지 + 배포
- `npm run build` + `npm run lint`. 최종 리뷰(로그인 리다이렉트 루프 없는지: 미인증 /admin/*→/login, 일반회원 로그인→/mypage, 기획단→/admin; /mypage 미인증→/login; 헤더 로그인상태 정확). main FF 머지 + push(사용자 승인).

## Self-Review
- 회원가입 헤더 노출(핵심) → Task 5. 공개 라우트 → 1·2. 역할분기 → 2(getLandingPath). 마이페이지 → 3. 헤더 인증상태 → 4·5.
- 루프 위험: 일반회원은 /admin 안 감(로그인→/mypage). 미인증 /admin/*→/login(공개, /admin 아님 → proxy 매칭 안 됨 → 무한루프 없음). /mypage 미인증→/login. OK.
- pending=일반회원 무권한은 기존대로. 오픈가입 rate-limit 후속(별개).
