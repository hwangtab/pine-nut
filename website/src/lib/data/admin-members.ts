import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AdminRole } from "@/lib/actions/auth";

export interface AdminMember {
  id: number;
  email: string;
  displayName: string | null;
  role: AdminRole;
  active: boolean;
  claimed: boolean; // user_id 존재 여부
  createdAt: string;
}

interface AdminMemberRow {
  id: number; email: string; display_name: string | null;
  role: AdminRole; active: boolean; user_id: string | null; created_at: string;
}

function rowToMember(r: AdminMemberRow): AdminMember {
  return {
    id: r.id, email: r.email, displayName: r.display_name, role: r.role,
    active: r.active, claimed: r.user_id !== null, createdAt: r.created_at,
  };
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_members")
    .select("id, email, display_name, role, active, user_id, created_at")
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.error("Failed to fetch admin members:", error);
    return [];
  }
  return (data as AdminMemberRow[]).map(rowToMember);
}

export async function getMyAdminMember(): Promise<{ role: AdminRole } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email ?? "").toLowerCase();
  // 보안: .or 문자열 보간 대신 파라미터화된 eq 2-쿼리 (PostgREST 필터 인젝션 회피)
  let { data } = await supabase
    .from("admin_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("role", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data && email) {
    ({ data } = await supabase
      .from("admin_members")
      .select("role")
      .eq("email", email)
      .eq("active", true)
      .order("role", { ascending: false })
      .limit(1)
      .maybeSingle());
  }
  if (!data) return null;
  return { role: data.role as AdminRole };
}
