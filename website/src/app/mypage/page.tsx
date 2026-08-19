import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMyAdminMember } from "@/lib/data/admin-members";
import { getMyMemberProfile } from "@/lib/data/member";
import LogoutButton from "@/components/auth/LogoutButton";
import NicknameForm from "./NicknameForm";

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
  const profile = await getMyMemberProfile();

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <div className="paper p-6 md:p-10">
       <div className="relative z-[1]">
        <h1 className="mb-2 font-serif-display text-2xl font-bold text-[var(--color-text)]">
          마이페이지
        </h1>
        <p className="mb-6 text-[var(--color-text-muted)]">
          환영합니다, {user.email}
        </p>

        <p className="mb-8 text-[var(--color-text)]">
          {me
            ? `기획단 · ${me.role}`
            : "일반 회원 · 게시판 기능이 곧 추가됩니다."}
        </p>

        <div className="mb-8">
          <h2 className="mb-2 font-serif-display text-lg font-bold text-[var(--color-text)]">닉네임</h2>
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            게시판 글쓰기 전에 닉네임을 설정하세요.
          </p>
          <NicknameForm current={profile?.nickname ?? null} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {me && (
            <Link
              href="/admin"
              className="px-5 py-3 text-base font-semibold text-white bg-[var(--color-forest)] rounded-full hover:opacity-90 transition-opacity"
            >
              관리자 페이지로
            </Link>
          )}
          <Link
            href="/"
            className="px-5 py-3 text-base font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg)] transition-colors"
          >
            홈으로
          </Link>
          <LogoutButton />
        </div>
       </div>
      </div>
    </div>
  );
}
