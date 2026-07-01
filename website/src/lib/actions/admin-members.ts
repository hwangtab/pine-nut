"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/admin-roles";
import { requireOwner } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

const VALID_ROLES: AdminRole[] = ["owner", "editor", "viewer"];

function revalidateMembers() {
  revalidatePath("/admin/members");
}

// 마지막 활성 owner를 강등/비활성/삭제하려는지 검사
async function wouldRemoveLastOwner(
  supabase: SupabaseClient,
  targetId: number,
): Promise<boolean> {
  const { data } = await supabase
    .from("admin_members")
    .select("id")
    .eq("role", "owner")
    .eq("active", true);
  const owners: { id: number }[] = data ?? [];
  return owners.length <= 1 && owners.some((o) => o.id === targetId);
}

export async function addAdminMemberAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;

  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const role = (formData.get("role") as string | null)?.trim() ?? "";
  const displayName = (formData.get("display_name") as string | null)?.trim() || null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };
  if (!VALID_ROLES.includes(role as AdminRole)) return { error: "역할 값이 올바르지 않습니다." };

  const { data, error } = await supabase
    .from("admin_members")
    .insert({ email, role, display_name: displayName, active: true, created_by: gate.user.email ?? "owner" })
    .select("id")
    .single();
  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") return { error: "이미 등록된 이메일입니다." };
    return { error: "관리자 추가에 실패했습니다." };
  }
  await logAudit(supabase, "admin_members", data.id, "create", { entityKey: email, payload: { after: { email, role } } });
  revalidateMembers();
  return null;
}

export async function updateAdminRoleAction(id: number, role: string): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (!VALID_ROLES.includes(role as AdminRole)) return { error: "역할 값이 올바르지 않습니다." };
  if (role !== "owner" && (await wouldRemoveLastOwner(supabase, id))) {
    return { error: "마지막 owner는 강등할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").update({ role }).eq("id", id);
  if (error) return { error: "역할 변경에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "update", { payload: { role } });
  revalidateMembers();
  return null;
}

export async function setAdminActiveAction(id: number, active: boolean): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (!active && (await wouldRemoveLastOwner(supabase, id))) {
    return { error: "마지막 owner는 비활성화할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").update({ active }).eq("id", id);
  if (error) return { error: "상태 변경에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "update", { payload: { active } });
  revalidateMembers();
  return null;
}

export async function removeAdminMemberAction(id: number): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (await wouldRemoveLastOwner(supabase, id)) {
    return { error: "마지막 owner는 삭제할 수 없습니다." };
  }
  const { error } = await supabase.from("admin_members").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했습니다." };
  await logAudit(supabase, "admin_members", id, "delete", {});
  revalidateMembers();
  return null;
}
