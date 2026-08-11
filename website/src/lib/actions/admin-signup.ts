"use server";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { ActionState } from "./state";

// 보상 삭제 실패로 생긴 고스트는 "방금 만들어진" 계정이다. 그보다 오래된 계정은
// owner가 명부에서 제거한 정상 계정으로 보고 자동 복구 대상에서 제외한다.
const ORPHAN_HEAL_WINDOW_MS = 30 * 60 * 1000;

// listUsers 페이지를 순회해 이메일로 auth 사용자를 찾는다(admin API에 이메일 직접 조회가 없음).
async function findAuthUserByEmail(
  service: SupabaseClient,
  email: string,
): Promise<{ id: string; created_at: string } | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    const users = data?.users ?? [];
    if (error || users.length === 0) return null;
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) return { id: hit.id, created_at: hit.created_at };
    if (users.length < 200) return null;
  }
  return null;
}

// owner가 이 이메일을 명부에서 제거한 이력이 있는지 확인한다.
// 이력이 있으면 "고스트"가 아니라 의도적으로 자격을 박탈한 계정이므로 복구하면 안 된다.
async function wasRemovedByOwner(service: SupabaseClient, email: string): Promise<boolean> {
  const { data, error } = await service
    .from("audit_log")
    .select("id")
    .eq("table_name", "admin_members")
    .eq("action", "delete")
    .eq("entity_key", email)
    .limit(1);
  // 조회 자체가 실패하면 판단할 수 없다 → fail-closed(제거된 것으로 간주해 복구 차단).
  if (error) return true;
  return (data ?? []).length > 0;
}

// 제출한 비밀번호가 실제 그 계정의 비밀번호인지 확인한다.
// service-role 클라이언트가 아니라 anon 키로 로그인을 시도해야 실제 검증이 된다.
async function verifyPassword(email: string, password: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  const probe = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await probe.auth.signInWithPassword({ email, password });
  if (error || !data.session) return false;
  // scope를 지정하지 않으면 global이라, 이 검증만으로 그 사용자의 다른 기기
  // 세션까지 끊긴다. 방금 발급받은 probe 토큰만 폐기하면 충분하다.
  await probe.auth.signOut({ scope: "local" });
  return true;
}

// "auth.users에는 있으나 admin_members 행이 없는" 고스트 계정을 명부에 복구한다.
// (가입 도중 보상 삭제가 실패해 생긴 상태)
//
// 이 경로는 비로그인 요청이 도달할 수 있으므로, 세 가지를 모두 만족할 때만 복구한다:
//   1) owner가 제거한 이력이 없을 것 — 자격 박탈을 무효화하지 않기 위해
//   2) auth 계정이 방금 생성됐을 것 — 진짜 고스트는 가입 실패 직후 상태다
//   3) 제출한 비밀번호가 실제로 맞을 것 — 이메일만 아는 제3자를 배제
async function healOrphanMember(
  service: SupabaseClient,
  email: string,
  password: string,
): Promise<boolean> {
  const { data: existing } = await service.from("admin_members").select("id").eq("email", email).maybeSingle();
  if (existing) return false; // 명부에 이미 있음 → 정상적인 "이미 가입" 상태
  if (await wasRemovedByOwner(service, email)) return false;
  const user = await findAuthUserByEmail(service, email);
  if (!user) return false;
  const age = Date.now() - new Date(user.created_at).getTime();
  if (!Number.isFinite(age) || age > ORPHAN_HEAL_WINDOW_MS) return false;
  if (!(await verifyPassword(email, password))) return false;
  const { error } = await service.from("admin_members").insert({
    email,
    role: "pending",
    active: true,
    user_id: user.id,
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
      // auth엔 있으나 명부에 없을 수 있음(가입 중 보상 삭제 실패로 인한 고스트) → 명부만 복구
      if (await healOrphanMember(service, email, password)) return null;
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
    // 동시 가입 레이스 방어: 같은 이메일의 다른 요청이 healOrphanMember 경로로 방금 이
    // user_id를 명부에 이미 연결했을 수 있다. 그 상태에서 auth 계정을 지우면 user_id가
    // NULL인 고아 명부 행이 남아(ON DELETE SET NULL) 이메일이 가입·로그인 모두 막히는
    // 영구 잠김이 된다. 따라서 이 user_id로 연결된 명부 행이 없을 때만 계정을 정리한다.
    const { data: linked } = await service
      .from("admin_members").select("id").eq("user_id", created.user.id).maybeSingle();
    if (linked) return null; // 이미 명부에 연결됨(계정+행 정상) → 가입 성공으로 처리
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
