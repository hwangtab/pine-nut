"use client";

import { useEffect, useState } from "react";
import { isAdminRole, type AdminRole } from "@/lib/admin-roles";

export interface AdminSessionState {
  /** owner/editor — 인라인 편집(편집 모드·툴바)을 할 수 있는 사람 */
  isAdmin: boolean;
  /** owner/editor/viewer — 기획단 화면(/admin)에 들어갈 수 있는 사람 */
  isActiveAdmin: boolean;
  /** 일반 회원 포함, 로그인한 모든 사람 */
  isLoggedIn: boolean;
}

const SIGNED_OUT: AdminSessionState = {
  isAdmin: false,
  isActiveAdmin: false,
  isLoggedIn: false,
};

/**
 * 세션 쿠키가 있는지만 본다. @supabase/ssr의 브라우저 클라이언트는 세션을
 * `sb-<project-ref>-auth-token` 쿠키에 담는다(용량이 크면 `.0` `.1`로 쪼갠다).
 * 이 검사는 화면 표시용 힌트일 뿐이다 — 쿠키를 위조해도 권한은 서버가 준다.
 */
function hasStoredSession(): boolean {
  try {
    return /(?:^|;\s*)sb-[^=;]*-auth-token(?:\.\d+)?=/.test(document.cookie);
  } catch {
    return false;
  }
}

/**
 * 로그인·권한 상태를 브라우저에서 판정한다.
 *
 * 예전에는 루트 레이아웃이 서버에서 auth.getUser() + admin_role()로 이 값을
 * 구해 props로 내려줬다. 그 조회가 next/headers의 cookies()에 닿기 때문에
 * 사이트의 모든 공개 페이지가 "요청마다 서버 렌더"로 고정됐고, 방문자 수만큼
 * 서버 함수가 깨어났다. 이 페이지들의 내용은 방문자가 누구든 똑같으므로 그럴
 * 이유가 없다 — 판정을 클라이언트로 옮겨 HTML을 CDN에서 서빙한다.
 *
 * 비용은 방문자 대부분에게 0이다. getSession()은 저장된 세션만 읽고 네트워크에
 * 나가지 않으므로, 로그인하지 않은 방문자는 여기서 곧바로 끝난다. 로그인한
 * 사람만 admin_role() 왕복 1회를 추가로 낸다.
 *
 * 대가는 로그인한 사용자에게 내비게이션의 로그인 영역과 편집 툴바가 첫 페인트
 * 직후에 나타난다는 것이다(비로그인 상태가 초기값이므로 로그아웃한 방문자에게는
 * 깜빡임이 없다). 관리자 전용 화면(/admin)의 접근 통제는 이 훅과 무관하게
 * src/proxy.ts와 각 서버 액션의 requireEditor()가 계속 담당한다 — 이 값은
 * 어디까지나 화면 표시용이며, 조작해도 권한이 생기지 않는다.
 *
 * supabase-js는 정적으로 import하지 않는다. 이 훅이 루트 레이아웃 안에 있어,
 * 정적 import는 인증 클라이언트 한 벌(gzip 약 55KB)을 로그인하지 않은 방문자
 * 전원의 번들에 밀어넣는다 — 그들에게는 끝까지 쓸 일이 없는 코드다. 세션
 * 쿠키가 있을 때만 내려받는다.
 */

export default function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>(SIGNED_OUT);

  useEffect(() => {
    // 세션 쿠키가 없으면 여기서 끝난다 — 인증 클라이언트를 내려받지도 않는다.
    // 로그인·로그아웃은 모두 전체 페이지 이동으로 끝나므로(login/signup 페이지,
    // LogoutButton, AdminSidebar), 이 훅이 다시 마운트되며 세션을 집어든다.
    if (!hasStoredSession()) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function boot() {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase-browser");
      const client = createSupabaseBrowserClient();
      if (!client || cancelled) return;

      const resolveRole = async (): Promise<AdminSessionState> => {
        const {
          data: { session },
        } = await client.auth.getSession();

        // 쿠키는 있었지만 세션이 만료됐을 수 있다. 이때도 네트워크에 나가지 않는다.
        if (!session) return SIGNED_OUT;

        const { data, error } = await client.rpc("admin_role");
        // 권한 조회가 실패하면 "권한 없음"으로 떨어뜨린다. 실패를 관리자로
        // 해석하면 툴바가 잘못 뜨고, 저장은 어차피 서버에서 거부되므로 사용자는
        // 이유 없는 에러만 보게 된다.
        const role: AdminRole | null = !error && isAdminRole(data) ? data : null;

        return {
          isLoggedIn: true,
          isActiveAdmin: role != null,
          isAdmin: role === "owner" || role === "editor",
        };
      };

      const apply = () => {
        resolveRole()
          .then((next) => {
            if (!cancelled) setState(next);
          })
          .catch(() => {
            if (!cancelled) setState(SIGNED_OUT);
          });
      };

      apply();

      // 이 탭에서 세션이 바뀌면(토큰 갱신, 다른 탭의 로그아웃) 다시 판정한다.
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event) => {
        // 구독을 걸면 supabase-js가 현재 상태를 INITIAL_SESSION으로 한 번 흘려보낸다.
        // 위의 최초 조회가 이미 그 일을 했으므로 무시한다 — 그러지 않으면 로그인한
        // 사람은 페이지를 열 때마다 admin_role() 왕복을 두 번 낸다.
        if (event === "INITIAL_SESSION") return;
        apply();
      });

      unsubscribe = () => subscription.unsubscribe();
      // 클라이언트를 내려받는 사이에 언마운트됐으면 곧바로 정리한다.
      if (cancelled) unsubscribe();
    }

    void boot();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return state;
}
