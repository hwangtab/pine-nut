import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMyAdminMember } from "@/lib/data/admin-members";
import LogoutButton from "./LogoutButton";

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!user) {
    redirect("/login");
  }

  const me = await getMyAdminMember();

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <div className="rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6 md:p-10">
        <h1 className="mb-2 text-2xl font-bold text-[var(--color-admin-text)]">
          마이페이지
        </h1>
        <p className="mb-6 text-[var(--color-admin-muted)]">
          환영합니다, {user.email}
        </p>

        <p className="mb-8 text-[var(--color-admin-text)]">
          {me
            ? "기획단 (관리자)"
            : "일반 회원 — 게시판 기능 준비 중입니다."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {me && (
            <Link
              href="/admin"
              className="px-5 py-3 text-base font-semibold text-white bg-[var(--color-forest)] rounded-xl hover:opacity-90 transition-opacity"
            >
              관리자 페이지로
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
