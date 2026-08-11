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
  const { data: before } = await supabase
    .from("admin_members").select("email, role").eq("id", id).maybeSingle();
  // .select()로 영향 행을 확인한다. RLS에 걸리거나 대상이 이미 사라졌을 때
  // 0행 갱신을 성공으로 오인해 "변경됐다"고 안내하는 것을 막는다.
  const { data: changed, error } = await supabase
    .from("admin_members").update({ role }).eq("id", id).select("id").maybeSingle();
  if (error) return { error: "역할 변경에 실패했습니다." };
  if (!changed) return { error: "대상을 찾을 수 없거나 권한이 없습니다." };
  await logAudit(supabase, "admin_members", id, "update", {
    entityKey: (before as { email?: string } | null)?.email,
    payload: { before: { role: (before as { role?: string } | null)?.role }, after: { role } },
  });
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
  const { data: before } = await supabase
    .from("admin_members").select("email, active").eq("id", id).maybeSingle();
  const { data: changed, error } = await supabase
    .from("admin_members").update({ active }).eq("id", id).select("id").maybeSingle();
  if (error) return { error: "상태 변경에 실패했습니다." };
  if (!changed) return { error: "대상을 찾을 수 없거나 권한이 없습니다." };
  await logAudit(supabase, "admin_members", id, "update", {
    entityKey: (before as { email?: string } | null)?.email,
    payload: { before: { active: (before as { active?: boolean } | null)?.active }, after: { active } },
  });
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
  // 삭제 전 대상 정보 확보(pending 거부 시 auth 계정도 함께 정리 / 감사 로그 기록)
  const { data: target } = await supabase
    .from("admin_members").select("user_id, role, email").eq("id", id).maybeSingle();
  const { data: deleted, error } = await supabase
    .from("admin_members").delete().eq("id", id).select("id").maybeSingle();
  if (error) return { error: "삭제에 실패했습니다." };
  // 0행 삭제(이미 사라졌거나 RLS 차단)를 성공으로 오인하면, 아래 auth 계정 삭제가
  // 되돌릴 수 없는 CASCADE를 일으킬 수 있다. 반드시 1행 삭제를 확인한 뒤 진행한다.
  if (!deleted) return { error: "대상을 찾을 수 없거나 권한이 없습니다." };
  // 대기(pending) 계정을 거부할 때만 auth 계정도 제거한다.
  // → 잘못 선점된 이메일의 재가입을 허용하고 고스트 계정을 방지한다.
  //   (실제 기획단원은 명부에서만 제거해 auth 계정/게시글을 보존한다.)
  const t = target as { user_id: string | null; role: string; email: string } | null;
  let authUserDeleted = false;
  if (t?.role === "pending" && t.user_id) {
    // 이 사용자가 남긴 게시판 콘텐츠가 있으면 auth 계정을 지우지 않는다.
    // board_posts/board_comments.author_user_id가 ON DELETE CASCADE라, auth 계정을 지우면
    // 본인 글은 물론 그 글에 달린 타인의 댓글·좋아요까지 함께 삭제되기 때문이다.
    // 콘텐츠가 있으면 명부에서만 제거되어(회원 자격만 상실) 기존 글은 보존된다.
    const [postRes, commentRes] = await Promise.all([
      supabase.from("board_posts").select("id", { count: "exact", head: true }).eq("author_user_id", t.user_id),
      supabase.from("board_comments").select("id", { count: "exact", head: true }).eq("author_user_id", t.user_id),
    ]);
    // 카운트를 확정하지 못하면(쿼리 오류) fail-closed: 콘텐츠가 없다고 오판해 되돌릴 수 없는
    // auth 삭제(+CASCADE)를 강행하지 않도록, 확실히 0건일 때만 삭제한다.
    const hasNoContent =
      !postRes.error && !commentRes.error &&
      (postRes.count ?? 0) === 0 && (commentRes.count ?? 0) === 0;
    if (hasNoContent) {
      const service = createSupabaseServiceClient();
      if (service) {
        const { error: authErr } = await service.auth.admin.deleteUser(t.user_id);
        if (authErr) console.error("removeAdminMemberAction: auth user delete failed", t.user_id, authErr.message);
        else authUserDeleted = true;
      }
    }
  }
  // 대상 식별 정보를 반드시 남긴다. 명부 행이 사라진 뒤에는 이 기록이 유일한 추적 수단이고,
  // claimAdminAccount가 "owner가 제거한 계정인지"를 판단하는 근거로도 사용한다.
  await logAudit(supabase, "admin_members", id, "delete", {
    entityKey: t?.email,
    payload: {
      before: { email: t?.email, role: t?.role, user_id: t?.user_id },
      auth_user_deleted: authUserDeleted,
    },
  });
  revalidateMembers();
  return null;
}
