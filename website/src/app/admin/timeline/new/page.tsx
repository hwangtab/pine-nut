import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createTimelineAction } from "@/lib/actions/timeline";
import TimelineForm from "@/components/admin/TimelineForm";

export default async function AdminTimelineNewPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/timeline" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← 타임라인 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">새 타임라인 이벤트</h1>
      <TimelineForm action={createTimelineAction} submitLabel="등록하기" />
    </div>
  );
}
