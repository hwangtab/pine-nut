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

export async function createNewsAction(formData: FormData) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase.from("news").insert({
    slug: (formData.get("slug") as string).trim(),
    title: (formData.get("title") as string).trim(),
    summary: (formData.get("summary") as string).trim(),
    content: (formData.get("content") as string).trim(),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    source_url: (formData.get("source_url") as string)?.trim() || "",
    source_name: (formData.get("source_name") as string)?.trim() || "",
    thumbnail_url: (formData.get("thumbnail_url") as string)?.trim() || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updateNewsAction(id: number, formData: FormData) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("news")
    .update({
      slug: (formData.get("slug") as string).trim(),
      title: (formData.get("title") as string).trim(),
      summary: (formData.get("summary") as string).trim(),
      content: (formData.get("content") as string).trim(),
      date: formData.get("date") as string,
      category: formData.get("category") as string,
      source_url: (formData.get("source_url") as string)?.trim() || "",
      source_name: (formData.get("source_name") as string)?.trim() || "",
      thumbnail_url: (formData.get("thumbnail_url") as string)?.trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deleteNewsAction(id: number) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("news")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function restoreNewsAction(id: number) {
  const supabase = await getAuthenticatedClient();

  const { error } = await supabase
    .from("news")
    .update({ is_deleted: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/news");
  revalidatePath("/admin/news");
}
