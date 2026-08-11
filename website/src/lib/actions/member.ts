"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "./auth";
import type { ActionState } from "./state";

const NICKNAME_ERRORS: Record<string, string> = {
  forbidden: "로그인이 필요합니다.",
  invalid: "닉네임은 2~20자로, 특수문자나 연속 공백 없이 입력해주세요.",
  duplicate: "이미 사용 중인 닉네임입니다. 다른 이름을 입력해주세요.",
  not_member: "회원만 닉네임을 설정할 수 있습니다.",
};

export async function setMyNickname(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nickname = (formData.get("nickname") as string | null)?.trim() ?? "";
  if (nickname.length < 2 || nickname.length > 20) return { error: "닉네임은 2~20자로 입력해주세요." };
  const gate = await requireMember();
  if ("error" in gate) return { error: gate.error };

  // v2는 중복 검사를 포함하고 실패 사유를 문자열로 돌려준다. 예전 boolean RPC는
  // 중복을 걸러내지 못해 타인 닉네임 사칭이 가능했다.
  const { data, error } = await gate.supabase.rpc("set_my_nickname_v2", { new_nickname: nickname });

  if (error) {
    // 함수가 아직 배포되지 않은 환경에서만 예전 RPC로 폴백한다.
    const missingFunction =
      error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
    if (!missingFunction) {
      console.error("setMyNickname: rpc failed", error.message);
      return { error: "닉네임 저장에 실패했습니다." };
    }
    const legacy = await gate.supabase.rpc("set_my_nickname", { new_nickname: nickname });
    if (legacy.error || legacy.data !== true) return { error: "닉네임 저장에 실패했습니다." };
    revalidatePath("/mypage");
    return null;
  }

  if (data !== "ok") {
    return { error: NICKNAME_ERRORS[data as string] ?? "닉네임 저장에 실패했습니다." };
  }
  revalidatePath("/mypage");
  return null;
}
