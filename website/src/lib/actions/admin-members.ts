"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireOwner } from "./auth";
import { logAudit } from "./audit";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
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
  // 삭제 전 대상 정보 확보(pending 거부 시 auth 계정도 함께 정리)
  const { data: target } = await supabase
    .from("admin_members").select("user_id, role").eq("id", id).maybeSingle();
  const { error } = await supabase.from("admin_members").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했습니다." };
  // 대기(pending) 계정을 거부할 때만 auth 계정도 제거한다.
  // → 잘못 선점된 이메일의 재가입을 허용하고 고스트 계정을 방지한다.
  //   (실제 기획단원은 명부에서만 제거해 auth 계정/게시글을 보존한다.)
  const t = target as { user_id: string | null; role: string } | null;
  if (t?.role === "pending" && t.user_id) {
    // 이 사용자가 남긴 게시판 콘텐츠가 있으면 auth 계정을 지우지 않는다.
    // board_posts/board_comments.author_user_id가 ON DELETE CASCADE라, auth 계정을 지우면
    // 본인 글은 물론 그 글에 달린 타인의 댓글·좋아요까지 함께 삭제되기 때문이다.
    // 콘텐츠가 있으면 명부에서만 제거되어(회원 자격만 상실) 기존 글은 보존된다.
    const [{ count: postCount }, { count: commentCount }] = await Promise.all([
      supabase.from("board_posts").select("id", { count: "exact", head: true }).eq("author_user_id", t.user_id),
      supabase.from("board_comments").select("id", { count: "exact", head: true }).eq("author_user_id", t.user_id),
    ]);
    if ((postCount ?? 0) === 0 && (commentCount ?? 0) === 0) {
      const service = createSupabaseServiceClient();
      if (service) {
        const { error: authErr } = await service.auth.admin.deleteUser(t.user_id);
        if (authErr) console.error("removeAdminMemberAction: auth user delete failed", t.user_id, authErr.message);
      }
    }
  }
  await logAudit(supabase, "admin_members", id, "delete", {});
  revalidateMembers();
  return null;
}
