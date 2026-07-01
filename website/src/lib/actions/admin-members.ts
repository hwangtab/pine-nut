"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireOwner } from "./auth";
import { logAudit } from "./audit";
import type { ActionState } from "./state";

const ASSIGNABLE_ROLES = ["owner", "editor", "viewer", "pending"] as const;

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

export async function updateAdminRoleAction(id: number, role: string): Promise<ActionState> {
  const gate = await requireOwner();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;
  if (!ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) return { error: "역할 값이 올바르지 않습니다." };
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
