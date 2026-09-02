"use client";

import { useEffect, useState } from "react";
import { isAdminRole, type AdminRole } from "@/lib/admin-roles";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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
 */
export default function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>(SIGNED_OUT);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    async function resolveRole(): Promise<AdminSessionState> {
      // supabase는 위에서 null 검사를 통과했지만 클로저 안에서는 좁혀지지 않는다.
      const client = supabase!;
      const {
        data: { session },
      } = await client.auth.getSession();

      // 저장된 세션이 없으면 여기서 끝 — 네트워크 요청은 한 번도 나가지 않는다.
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
    }

    resolveRole()
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch(() => {
        if (!cancelled) setState(SIGNED_OUT);
      });

    // 로그인·로그아웃이 이 탭에서 일어나면(로그인 페이지, LogoutButton) 그
    // 즉시 다시 판정한다. 이게 없으면 로그아웃한 뒤에도 새로고침 전까지
    // 내비게이션이 로그인 상태를 계속 보여준다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // 구독을 걸면 supabase-js가 현재 상태를 INITIAL_SESSION으로 한 번 흘려보낸다.
      // 위의 최초 조회가 이미 그 일을 했으므로 무시한다 — 그러지 않으면 로그인한
      // 사람은 페이지를 열 때마다 admin_role() 왕복을 두 번 낸다.
      if (event === "INITIAL_SESSION") return;
      resolveRole()
        .then((next) => {
          if (!cancelled) setState(next);
        })
        .catch(() => {
          if (!cancelled) setState(SIGNED_OUT);
        });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
