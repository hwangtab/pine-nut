"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createTimelineAction(formData: FormData) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase.from("timeline_events").insert({
    date: (formData.get("date") as string).trim(),
    year: parseInt(formData.get("year") as string, 10),
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string).trim(),
    category: formData.get("category") as string,
    image_url: (formData.get("image_url") as string)?.trim() || null,
    image_alt: (formData.get("image_alt") as string)?.trim() || null,
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function updateTimelineAction(id: number, formData: FormData) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("timeline_events")
    .update({
      date: (formData.get("date") as string).trim(),
      year: parseInt(formData.get("year") as string, 10),
      title: (formData.get("title") as string).trim(),
      description: (formData.get("description") as string).trim(),
      category: formData.get("category") as string,
      image_url: (formData.get("image_url") as string)?.trim() || null,
      image_alt: (formData.get("image_alt") as string)?.trim() || null,
      sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function deleteTimelineAction(id: number) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("timeline_events")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
}

export async function restoreTimelineAction(id: number) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("timeline_events")
    .update({ is_deleted: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
}
