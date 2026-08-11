"use server";

import { requireEditor } from "./auth";
import { logAudit } from "./audit";
import {
  IMAGE_EXT_BY_TYPE,
  sniffImageType,
  validateImageFile,
} from "@/lib/image-upload-limits";
import { revalidatePageContentPages } from "@/lib/actions/page-content/revalidation";
import {
  parsePageContentCreatedKeys,
  parsePageContentRestoreRows,
} from "@/lib/actions/page-content/restore-payload";
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
  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { supabase, user } = gate;
  const keys = normalizedChanges.map((change) => change.content_key);
  const { data: beforeRows } = await supabase
    .from("page_content")
    .select("content_key, content_type, value, metadata, page, section")
    .in("content_key", keys);

  // 동시 편집 방어: 편집을 시작할 때 본 값과 지금 DB 값이 다르면, 그 사이 다른
  // 관리자가 저장한 것이다. 그대로 upsert하면 상대의 변경이 흔적 없이 사라진다.
  const currentByKey = new Map(
    ((beforeRows ?? []) as { content_key: string; value: string }[]).map((row) => [
      row.content_key,
      row.value,
    ]),
  );
  const conflicted = normalizedChanges.filter((change) => {
    if (change.base_value === undefined) return false; // 기준값을 모르면 검사하지 않는다
    const current = currentByKey.get(change.content_key) ?? null;
    return current !== (change.base_value ?? null);
  });
  if (conflicted.length > 0) {
    return {
      error: `다른 관리자가 먼저 저장한 항목이 있습니다(${conflicted.length}개). 새로고침 후 다시 편집해주세요.`,
    };
  }

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

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const { supabase } = gate;
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
  // 그 저장으로 처음 생긴 키는 되돌릴 "이전 값"이 없다. override 자체를 지워야
  // 하드코딩 기본값으로 돌아간다. before만 복원하면 새로 덮어쓴 문구가 그대로 남는다.
  const createdKeys = parsePageContentCreatedKeys(payload);

  if (parsed.error && createdKeys.length === 0) {
    return { error: parsed.error };
  }

  const failed: string[] = [];
  for (const key of createdKeys) {
    const page = parsed.rows.find((row) => row.content_key === key)?.page;
    const result = await deletePageContentAction(key, page);
    if (result.error) failed.push(key);
  }

  if (parsed.rows.length > 0) {
    const saveResult = await savePageContentAction(parsed.rows);
    if (saveResult.error) return saveResult;
  }

  if (failed.length > 0) {
    return {
      error: `일부 항목(${failed.length}개)을 되돌리지 못했습니다. 새로고침 후 다시 시도해주세요.`,
    };
  }
  return { error: null };
}

/**
 * Upload an image and return its public URL.
 */
export async function uploadEditableImageAction(
  formData: FormData,
): Promise<{ url: string | null; error: string | null }> {
  const gate = await requireEditor();
  if ("error" in gate) return { url: null, error: gate.error };
  const { supabase } = gate;

  const file = formData.get("file") as File | null;
  if (!file) return { url: null, error: "파일이 없습니다." };

  // 용량·형식 검증은 뉴스/타임라인 업로드와 같은 규칙을 쓴다(선언 타입 + 실제 바이트).
  const validation = validateImageFile(file);
  if (!validation.ok) return { url: null, error: validation.error };

  const sniffed = await sniffImageType(file);
  if (!sniffed || sniffed !== file.type) {
    return { url: null, error: "이미지 파일이 아니거나 형식이 올바르지 않습니다." };
  }

  const ext = IMAGE_EXT_BY_TYPE[sniffed] || "jpg";
  const uuid = crypto.randomUUID();
  const path = `page-content/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(path, file, { contentType: sniffed });

  if (uploadError) {
    console.error("page_content upload error:", uploadError.message);
    return { url: null, error: "이미지 업로드에 실패했습니다. 다시 시도해주세요." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(path);

  // 다른 업로드 경로와 달리 여기만 기록이 없어, 인라인 편집으로 올린 이미지는
  // 누가 언제 올렸는지 추적할 수 없었다.
  await logAudit(supabase, "storage.images", 0, "create", {
    entityKey: publicUrl,
    payload: { folder: "page-content", url: publicUrl, file_name: file.name },
  });

  return { url: publicUrl, error: null };
}
