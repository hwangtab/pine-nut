"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminRole, ROLE_RANK, type AdminRole } from "@/lib/admin-roles";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface AuthenticatedActionContext {
  supabase: SupabaseClient;
  user: User;
}

export type AuthenticatedActionClient = AuthenticatedActionContext["supabase"];

async function getAuthenticatedActionContext(): Promise<AuthenticatedActionContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return { supabase, user };
}

export interface AdminContext {
  supabase: AuthenticatedActionClient;
  user: User;
  role: AdminRole;
  member: { id: number; email: string; displayName: string | null };
}

interface AdminMemberCandidate {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
}

type RankedAdminMemberCandidate = AdminMemberCandidate & { role: AdminRole };

function pickHighestAdminMember(rows: AdminMemberCandidate[]): RankedAdminMemberCandidate | null {
  return rows
    .filter((row): row is RankedAdminMemberCandidate => isAdminRole(row.role))
    .sort((a, b) => {
      return ROLE_RANK[b.role] - ROLE_RANK[a.role] || a.id - b.id;
    })[0] ?? null;
}

async function loadAdminContext(): Promise<AdminContext | null> {
  const { supabase, user } = await getAuthenticatedActionContext();
  const email = (user.email ?? "").toLowerCase();

  const cols = "id, email, display_name, role";
  const candidates = new Map<number, AdminMemberCandidate>();

  const { data: userRows, error: userRowsError } = await supabase
    .from("admin_members")
    .select(cols)
    .eq("user_id", user.id)
    .eq("active", true);
  if (userRowsError) return null;
  for (const row of (userRows ?? []) as AdminMemberCandidate[]) {
    candidates.set(row.id, row);
  }

  if (email) {
    const { data: emailRows, error: emailRowsError } = await supabase
      .from("admin_members")
      .select(cols)
      .eq("email", email)
      .eq("active", true);
    if (emailRowsError) return null;
    for (const row of (emailRows ?? []) as AdminMemberCandidate[]) {
      candidates.set(row.id, row);
    }
  }
  const data = pickHighestAdminMember([...candidates.values()]);
  if (!data) return null;
  const role = data.role;
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
export async function requireActiveAdmin(): Promise<
  { supabase: AuthenticatedActionClient; user: User; role: AdminRole } | { error: string }
> {
  const ctx = await loadAdminContext();
  if (!ctx) return { error: "관리자 권한이 없습니다. 다시 로그인해주세요." };
  return { supabase: ctx.supabase, user: ctx.user, role: ctx.role };
}

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

// 게시판 작성용: pending 포함 활성 회원이면 통과(로그인 안 됐으면 에러, redirect 아님)
export async function requireMember(): Promise<
  { supabase: AuthenticatedActionClient; user: User; memberId: number; nickname: string | null } | { error: string }
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "서버 설정 오류입니다." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const email = (user.email ?? "").toLowerCase();
  const cols = "id, display_name";
  const seen = new Map<number, { id: number; display_name: string | null }>();
  const { data: byId } = await supabase.from("admin_members").select(cols).eq("user_id", user.id).eq("active", true);
  for (const r of (byId ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  if (email) {
    const { data: byEmail } = await supabase.from("admin_members").select(cols).eq("email", email).eq("active", true);
    for (const r of (byEmail ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  }
  const row = [...seen.values()].sort((a, b) => a.id - b.id)[0];
  if (!row) return { error: "회원만 작성할 수 있습니다." };
  return { supabase, user, memberId: row.id, nickname: row.display_name ?? null };
}
