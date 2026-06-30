"use server";

import { getAuthenticatedActionContext } from "./auth";
import { logAudit } from "./audit";
import { revalidatePageContentPages } from "@/lib/actions/page-content/revalidation";
import { parsePageContentRestoreRows } from "@/lib/actions/page-content/restore-payload";
import type {
  ContentChange,
  PageContentActionResult,
} from "@/lib/actions/page-content/types";
import {
  normalizeContentChanges,
  validateContentKey,
} from "@/lib/actions/page-content/validation";

/**
 * Save multiple content changes in a single batch.
 * Uses upsert on content_key to create or update.
 */
export async function savePageContentAction(
  changes: ContentChange[],
): Promise<PageContentActionResult> {
  if (changes.length === 0) return { error: null };

  const normalized = normalizeContentChanges(changes);
  if (normalized.error) {
    return { error: normalized.error };
  }

  const normalizedChanges = normalized.rows;
  const { supabase, user } = await getAuthenticatedActionContext();
  const keys = normalizedChanges.map((change) => change.content_key);
  const { data: beforeRows } = await supabase
    .from("page_content")
    .select("content_key, content_type, value, metadata, page, section")
    .in("content_key", keys);

  const rows = normalizedChanges.map((change) => ({
    content_key: change.content_key,
    content_type: change.content_type,
    value: change.value,
    metadata: change.metadata ?? {},
    page: change.page,
    section: change.section ?? null,
    updated_at: new Date().toISOString(),
    updated_by: user.email ?? "unknown",
  }));

  const { error } = await supabase
    .from("page_content")
    .upsert(rows, { onConflict: "content_key" });

  if (error) {
    console.error("page_content upsert error:", error.message);
    return { error: "저장 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  await logAudit(supabase, "page_content", 0, "bulk_update", {
    payload: {
      before: beforeRows ?? [],
      after: normalizedChanges,
    },
  });

  revalidatePageContentPages(new Set(normalizedChanges.map((change) => change.page)));

  return { error: null };
}

/**
 * Delete a single content override, reverting to hardcoded default.
 */
export async function deletePageContentAction(
  contentKey: string,
  page?: string,
): Promise<PageContentActionResult> {
  const keyError = validateContentKey(contentKey, "잘못된 content_key 형식입니다.");
  if (keyError) return { error: keyError };

  const { supabase } = await getAuthenticatedActionContext();
  const { data: beforeRow } = await supabase
    .from("page_content")
    .select("content_key, content_type, value, metadata, page, section")
    .eq("content_key", contentKey)
    .maybeSingle();

  const { error } = await supabase
    .from("page_content")
    .delete()
    .eq("content_key", contentKey);

  if (error) {
    console.error("page_content delete error:", error.message);
    return { error: "삭제 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  await logAudit(supabase, "page_content", 0, "delete", {
    entityKey: contentKey,
    payload: {
      before: beforeRow,
    },
  });

  revalidatePageContentPages([page ?? "home"]);
  return { error: null };
}

export async function restorePageContentVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<PageContentActionResult> {
  const parsed = parsePageContentRestoreRows(payload);
  if (parsed.error) {
    return { error: parsed.error };
  }

  return savePageContentAction(parsed.rows);
}

/**
 * Upload an image and return its public URL.
 */
export async function uploadEditableImageAction(
  formData: FormData,
): Promise<{ url: string | null; error: string | null }> {
  const { supabase } = await getAuthenticatedActionContext();

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
    console.error("page_content upload error:", uploadError.message);
    return { url: null, error: "이미지 업로드에 실패했습니다. 다시 시도해주세요." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(path);

  return { url: publicUrl, error: null };
}
