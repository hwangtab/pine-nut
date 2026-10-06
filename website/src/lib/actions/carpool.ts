"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit";
import { requireEditor } from "@/lib/actions/auth";

export async function deleteCarpoolRiderAction(id: number): Promise<{ error?: string }> {
  const ctx = await requireEditor();
  if ("error" in ctx) return { error: ctx.error };

  const { error } = await ctx.supabase.from("carpool_riders").delete().eq("id", id);
  if (error) {
    console.error("carpool: delete failed", error.message);
    return { error: "취소하지 못했습니다." };
  }

  await logAudit(ctx.supabase, "carpool_riders", id, "delete");
  revalidatePath("/admin/carpool");
  return {};
}
