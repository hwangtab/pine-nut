import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 쿠키를 읽지 않는 서버용 익명 클라이언트.
 *
 * createSupabaseServerClient()(supabase-server.ts)는 next/headers의 cookies()를
 * 호출한다 — 그 한 줄이 호출한 라우트를 영구히 동적 렌더링으로 못박는다. 방문자
 * 세션과 무관한 공개 데이터(page_content 등)를 그 클라이언트로 읽으면, 읽을
 * 필요가 없는 쿠키 때문에 페이지 전체가 CDN 캐시 대상에서 빠지고 방문자 수만큼
 * 서버 함수가 깨어난다.
 *
 * 이 클라이언트는 세션이 없으므로 RLS 상 anon 역할로 동작한다 — 익명 읽기가
 * 허용된 테이블(page_content_public_read 정책 등)에만 쓸 것. 사용자별로 달라지는
 * 데이터에는 절대 쓰지 않는다.
 */
export function createSupabaseAnonClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
