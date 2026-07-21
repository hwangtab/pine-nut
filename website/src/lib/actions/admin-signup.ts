"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { ActionState } from "./state";

// listUsers 페이지를 순회해 이메일로 auth 사용자 id를 찾는다(admin API에 이메일 직접 조회가 없음).
async function findAuthUserIdByEmail(service: SupabaseClient, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    const users = data?.users ?? [];
    if (error || users.length === 0) return null;
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) return hit.id;
    if (users.length < 200) return null;
  }
  return null;
}

// "auth.users에는 있으나 admin_members 행이 없는" 고스트 계정을 명부에 복구한다.
// (과거 가입 시 보상 삭제가 실패해 생긴 상태) 비밀번호는 건드리지 않으므로,
// 원 가입자가 자기 비밀번호로 로그인하면 회원으로 인식된다.
async function healOrphanMember(service: SupabaseClient, email: string): Promise<boolean> {
  const { data: existing } = await service.from("admin_members").select("id").eq("email", email).maybeSingle();
  if (existing) return false; // 명부에 이미 있음 → 정상적인 "이미 가입" 상태
  const userId = await findAuthUserIdByEmail(service, email);
  if (!userId) return false;
  const { error } = await service.from("admin_members").insert({
    email,
    role: "pending",
    active: true,
    user_id: userId,
    created_by: "self-heal",
  });
  return !error;
}

export async function claimAdminAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  const service = createSupabaseServiceClient();
  if (!service) return { error: "서버 설정 오류입니다. 관리자에게 문의해주세요." };

  // 1) 중복 가입 확인
  const { data: existing } = await service
    .from("admin_members")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { error: "이미 가입된 이메일입니다. 로그인해주세요." };

  // 2) Auth 계정 생성 (이메일 확인 생략)
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    if ((createErr?.message ?? "").toLowerCase().includes("already")) {
      // auth엔 있으나 명부에 없을 수 있음(과거 보상 삭제 실패로 인한 고스트) → 명부만 복구
      if (await healOrphanMember(service, email)) return null;
      return { error: "이미 가입된 이메일입니다. 로그인해주세요." };
    }
    return { error: "계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 3) 명부에 대기(pending) 권한으로 등록
  const { error: insertErr } = await service.from("admin_members").insert({
    email,
    role: "pending",
    active: true,
    user_id: created.user.id,
    created_by: "self-signup",
  });
  if (insertErr) {
    // 등록 실패 시 생성한 계정 정리(고아 방지). 정리마저 실패하면 고스트 계정이 남으므로
    // 로그를 남긴다(재가입 시 healOrphanMember가 명부를 복구한다).
    const { error: cleanupErr } = await service.auth.admin.deleteUser(created.user.id);
    if (cleanupErr) {
      console.error("claimAdminAccount: orphan auth user cleanup failed", created.user.id, cleanupErr.message);
    }
    return { error: "가입 처리에 실패했습니다. 다시 시도해주세요." };
  }

  return null;
}
