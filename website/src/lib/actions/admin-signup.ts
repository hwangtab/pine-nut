"use server";

import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { ActionState } from "./state";

export async function claimAdminAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  const service = createSupabaseServiceClient();
  if (!service) return { error: "서버 설정 오류입니다. 관리자에게 문의해주세요." };

  // 1) 명부 검증: active + 미가입(user_id NULL)
  const { data: member } = await service
    .from("admin_members")
    .select("id, active, user_id")
    .eq("email", email)
    .maybeSingle();
  if (!member || !member.active) return { error: "등록되지 않은 이메일입니다. owner에게 명부 등록을 요청하세요." };
  if (member.user_id) return { error: "이미 가입된 계정입니다. 로그인해주세요." };

  // 2) Auth 계정 생성 (이메일 확인 생략)
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    if ((createErr?.message ?? "").toLowerCase().includes("already")) {
      return { error: "이미 가입된 이메일입니다. 로그인해주세요." };
    }
    return { error: "계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 3) 명부에 user_id 연결
  const { error: linkErr } = await service
    .from("admin_members")
    .update({ user_id: created.user.id })
    .eq("id", member.id);
  if (linkErr) {
    // 연결 실패 시 생성한 계정 정리(고아 방지)
    await service.auth.admin.deleteUser(created.user.id);
    return { error: "가입 연결에 실패했습니다. 다시 시도해주세요." };
  }

  return null;
}
