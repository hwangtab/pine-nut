import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) {
    return response;
  }

  const { data: isActiveAdmin, error: adminCheckError } =
    await supabase.rpc("is_active_admin");
  const canAccessAdmin = adminCheckError ? false : isActiveAdmin === true;

  if (isAdminPublicPage) {
    return canAccessAdmin
      ? NextResponse.redirect(new URL("/admin", request.url))
      : response;
  }

  if (!canAccessAdmin) {
    // 로그인했지만 관리자(기획단)가 아닌 일반 회원 → 마이페이지로
    return NextResponse.redirect(new URL("/mypage", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
