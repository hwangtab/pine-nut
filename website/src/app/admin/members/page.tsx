import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/actions/auth";
import { getAdminMembers } from "@/lib/data/admin-members";
import MembersManager from "./MembersManager";

export default async function AdminMembersPage() {
  const ctx = await getAdminContext();
  if (ctx.role !== "owner") redirect("/admin");
  const members = await getAdminMembers();
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-6">기획단(관리자) 관리</h1>
      <MembersManager members={members} />
    </div>
  );
}
