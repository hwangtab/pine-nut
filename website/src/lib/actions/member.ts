"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "./auth";
import type { ActionState } from "./state";

export async function setMyNickname(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nickname = (formData.get("nickname") as string | null)?.trim() ?? "";
  if (nickname.length < 2 || nickname.length > 20) return { error: "닉네임은 2~20자로 입력해주세요." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };
  const { data, error } = await gate.supabase.rpc("set_my_nickname", { new_nickname: nickname });
  if (error || data !== true) return { error: "닉네임 저장에 실패했습니다." };
  revalidatePath("/mypage");
  return null;
}
