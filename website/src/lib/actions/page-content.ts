"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { logAudit } from "./audit";

interface ContentChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { supabase, user };
}

/**
 * Save multiple content changes in a single batch.
 * Uses upsert on content_key to create or update.
 */
export async function savePageContentAction(
  changes: ContentChange[]
): Promise<{ error: string | null }> {
  if (changes.length === 0) return { error: null };

  const KEY_PATTERN = /^[a-zA-Z0-9._-]+$/;
  for (const c of changes) {
    if (!KEY_PATTERN.test(c.content_key)) {
      return { error: `잘못된 content_key: ${c.content_key}` };
    }
  }

  const { supabase, user } = await getAuthenticatedClient();

  const rows = changes.map((c) => ({
    content_key: c.content_key,
    content_type: c.content_type,
    value: c.value,
    metadata: c.metadata ?? {},
    page: c.page,
    section: c.section ?? null,
    updated_at: new Date().toISOString(),
    updated_by: user.email ?? "unknown",
  }));

  const { error } = await supabase
    .from("page_content")
    .upsert(rows, { onConflict: "content_key" });

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  await logAudit(supabase, "page_content", 0, "bulk_update");

  // Revalidate all public pages
  const pages = [...new Set(changes.map((c) => c.page))];
  for (const page of pages) {
    const path = page === "home" ? "/" : `/${page}`;
    revalidatePath(path);
  }
  revalidatePath("/");

  return { error: null };
}

/**
 * Delete a single content override, reverting to hardcoded default.
 */
export async function deletePageContentAction(
  contentKey: string,
  page?: string
): Promise<{ error: string | null }> {
  const { supabase } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("page_content")
    .delete()
    .eq("content_key", contentKey);

  if (error) {
    return { error: `삭제 실패: ${error.message}` };
  }

  await logAudit(supabase, "page_content", 0, "delete");

  if (page) {
    const path = page === "home" ? "/" : `/${page}`;
    revalidatePath(path);
  }
  revalidatePath("/");
  return { error: null };
}

/**
 * Upload an image and return its public URL.
 */
export async function uploadEditableImageAction(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const { supabase } = await getAuthenticatedClient();

  const file = formData.get("file") as File | null;
  if (!file) return { url: null, error: "파일이 없습니다." };

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { url: null, error: "파일 크기는 5MB 이하여야 합니다." };
  }

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: "JPG, PNG, WebP만 업로드 가능합니다." };
  }

  const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = MIME_TO_EXT[file.type] || "jpg";
  const uuid = crypto.randomUUID();
  const path = `page-content/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(path, file);

  if (uploadError) {
    return { url: null, error: `업로드 실패: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(path);

  return { url: publicUrl, error: null };
}
