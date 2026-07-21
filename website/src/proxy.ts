import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// getUser()가 토큰을 갱신하면 그 Set-Cookie가 `response`에 실린다.
// redirect로 새 응답을 만들면 갱신된 쿠키가 유실되어(다음 요청이 무효 refresh 토큰을 써서)
// 간헐적 강제 로그아웃이 발생하므로, 갱신 쿠키를 redirect 응답으로 복사한다.
function redirectPreservingCookies(pathname: string, request: NextRequest, response: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminSignupPage = pathname === "/admin/signup";
  const isAdminPublicPage = isAdminLoginPage || isAdminSignupPage;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isAdminPublicPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isAdminPublicPage) {
    return redirectPreservingCookies("/login", request, response);
  }

  if (!user) {
    return response;
  }

  const { data: isActiveAdmin, error: adminCheckError } =
    await supabase.rpc("is_active_admin");
  const canAccessAdmin = adminCheckError ? false : isActiveAdmin === true;

  if (isAdminPublicPage) {
    return canAccessAdmin
      ? redirectPreservingCookies("/admin", request, response)
      : response;
  }

  if (!canAccessAdmin) {
    // 로그인했지만 관리자(기획단)가 아닌 일반 회원 → 마이페이지로
    return redirectPreservingCookies("/mypage", request, response);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
