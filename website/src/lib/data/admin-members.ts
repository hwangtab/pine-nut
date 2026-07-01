import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdminRole, ROLE_RANK, type AdminRole } from "@/lib/admin-roles";

export type MemberRole = AdminRole | "pending";

export interface AdminMember {
  id: number;
  email: string;
  displayName: string | null;
  role: MemberRole;
  active: boolean;
  claimed: boolean; // user_id 존재 여부
  createdAt: string;
}

interface AdminMemberRow {
  id: number; email: string; display_name: string | null;
  role: string; active: boolean; user_id: string | null; created_at: string;
}

function isMemberRole(role: unknown): role is MemberRole {
  return isAdminRole(role) || role === "pending";
}

function rowToMember(r: AdminMemberRow): AdminMember | null {
  if (!isMemberRole(r.role)) return null;
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
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.error("Failed to fetch admin members:", error);
    return [];
  }
  const rank = (role: MemberRole) => (isAdminRole(role) ? ROLE_RANK[role] : 0);
  return (data as AdminMemberRow[])
    .map(rowToMember)
    .filter((member): member is AdminMember => member !== null)
    .sort((a, b) => rank(b.role) - rank(a.role) || a.createdAt.localeCompare(b.createdAt));
}

export async function getMyAdminMember(): Promise<{ role: AdminRole } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("admin_role");
  if (error || !isAdminRole(data)) return null;
  return { role: data };
}
