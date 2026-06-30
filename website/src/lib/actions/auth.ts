"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface AuthenticatedActionContext {
  supabase: SupabaseClient;
  user: User;
}

export type AuthenticatedActionClient = AuthenticatedActionContext["supabase"];

export async function getAuthenticatedActionContext(): Promise<AuthenticatedActionContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return { supabase, user };
}

export async function getAuthenticatedActionClient(): Promise<AuthenticatedActionClient> {
  const { supabase } = await getAuthenticatedActionContext();
  return supabase;
}

export type AdminRole = "owner" | "editor" | "viewer";

const ROLE_RANK: Record<AdminRole, number> = { viewer: 1, editor: 2, owner: 3 };

export interface AdminContext {
  supabase: AuthenticatedActionClient;
  user: User;
  role: AdminRole;
  member: { id: number; email: string; displayName: string | null };
}

async function loadAdminContext(): Promise<AdminContext | null> {
  const { supabase, user } = await getAuthenticatedActionContext();
  const email = (user.email ?? "").toLowerCase();

  const cols = "id, email, display_name, role";
  // 1) user_id 매칭 우선 (파라미터화된 eq — 인젝션 불가)
  let { data } = await supabase
    .from("admin_members")
    .select(cols)
    .eq("user_id", user.id)
    .eq("active", true)
    .order("role", { ascending: false })
    .limit(1)
    .maybeSingle();
  // 2) 없으면 email 매칭 (미가입 계정 등)
  if (!data && email) {
    ({ data } = await supabase
      .from("admin_members")
      .select(cols)
      .eq("email", email)
      .eq("active", true)
      .order("role", { ascending: false })
      .limit(1)
      .maybeSingle());
  }
  if (!data) return null;
  const role = data.role as AdminRole;
  if (!(role in ROLE_RANK)) return null; // 알 수 없는 role은 무권한 처리
  return {
    supabase,
    user,
    role,
    member: { id: data.id, email: data.email, displayName: data.display_name ?? null },
  };
}

// 페이지/레이아웃용: 활성 관리자가 아니면 로그인으로 redirect
export async function getAdminContext(): Promise<AdminContext> {
  const ctx = await loadAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

// 콘텐츠 변경 액션용: editor 이상 아니면 친화적 에러 반환(redirect 아님)
export async function requireEditor(): Promise<{ supabase: AuthenticatedActionClient; user: User } | { error: string }> {
  const ctx = await loadAdminContext();
  if (!ctx) return { error: "관리자 권한이 없습니다. 다시 로그인해주세요." };
  if (ROLE_RANK[ctx.role] < ROLE_RANK.editor) return { error: "편집 권한이 없습니다. (읽기 전용 계정)" };
  return { supabase: ctx.supabase, user: ctx.user };
}

// 명부 관리 액션용: owner 아니면 에러
export async function requireOwner(): Promise<{ supabase: AuthenticatedActionClient; user: User; role: AdminRole } | { error: string }> {
  const ctx = await loadAdminContext();
  if (!ctx) return { error: "관리자 권한이 없습니다. 다시 로그인해주세요." };
  if (ctx.role !== "owner") return { error: "이 작업은 owner만 할 수 있습니다." };
  return { supabase: ctx.supabase, user: ctx.user, role: ctx.role };
}
