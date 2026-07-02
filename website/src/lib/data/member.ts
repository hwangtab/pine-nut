import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getMyMemberProfile(): Promise<{ memberId: number; nickname: string | null; isMember: boolean } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email ?? "").toLowerCase();
  const seen = new Map<number, { id: number; display_name: string | null }>();
  const { data: byId } = await supabase.from("admin_members").select("id, display_name").eq("user_id", user.id).eq("active", true);
  for (const r of (byId ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  if (email) {
    const { data: byEmail } = await supabase.from("admin_members").select("id, display_name").eq("email", email).eq("active", true);
    for (const r of (byEmail ?? []) as { id: number; display_name: string | null }[]) seen.set(r.id, r);
  }
  const row = [...seen.values()].sort((a, b) => a.id - b.id)[0];
  if (!row) return null;
  return { memberId: row.id, nickname: row.display_name ?? null, isMember: true };
}
