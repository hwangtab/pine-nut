"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import { requireEditor } from "@/lib/actions/auth";

export async function deleteCarpoolRiderAction(id: number): Promise<{ error?: string }> {
  const ctx = await requireEditor();
  if ("error" in ctx) return { error: ctx.error };

  // RLS에 막히거나 이미 지워진 행이면 error 없이 0행이 지워진다 → 삭제된 행을 돌려받아 확인한다.
  const { data, error } = await ctx.supabase.from("carpool_riders").delete().eq("id", id).select("id");
  if (error) {
    console.error("carpool: delete failed", error.message);
    return { error: "취소하지 못했습니다." };
  }
  if (!data || data.length === 0) {
    revalidatePath("/admin/carpool");
    return { error: "이미 취소됐거나 찾을 수 없는 신청입니다." };
  }

  await logAudit(ctx.supabase, "carpool_riders", id, "delete");
  revalidatePath("/admin/carpool");
  return {};
}
