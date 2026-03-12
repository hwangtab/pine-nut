"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import { validateEditableHref } from "@/lib/validation/editable-link";
import { logAudit } from "./audit";

interface ContentChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
}

const CONTENT_TYPES = new Set([
  "text",
  "richtext",
  "image",
  "list",
  "link",
  "section",
]);

const PUBLIC_PAGE_PATHS = [
  "/",
  "/story",
  "/timeline",
  "/news",
  "/gallery",
  "/press",
  "/press/release",
  "/press/factsheet",
  "/share",
  "/petition",
  "/donate",
  "/privacy",
  "/en",
] as const;

const PAGE_PATHS: Record<string, readonly string[]> = {
  home: ["/"],
  story: ["/story"],
  timeline: ["/timeline"],
  news: ["/news"],
  gallery: ["/gallery"],
  press: ["/press", "/press/release", "/press/factsheet"],
  share: ["/share"],
  petition: ["/petition"],
  donate: ["/donate"],
  privacy: ["/privacy"],
  en: ["/en"],
  nav: PUBLIC_PAGE_PATHS,
  footer: PUBLIC_PAGE_PATHS,
};

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { supabase, user };
}

function normalizeChange(change: ContentChange): { row: ContentChange; error: string | null } {
  if (!CONTENT_TYPES.has(change.content_type)) {
    return {
      row: change,
      error: `지원하지 않는 content_type: ${change.content_type}`,
    };
  }

  if (!change.page.trim()) {
    return {
      row: change,
      error: `page 값이 비어 있습니다: ${change.content_key}`,
    };
  }

  if (change.content_type === "image") {
    const validation = validateOptionalImageUrl(change.value, "이미지 URL");
    if (validation.error || !validation.value) {
      return {
        row: change,
        error: validation.error ?? `잘못된 이미지 URL: ${change.content_key}`,
      };
    }

    return {
      row: {
        ...change,
        value: validation.value,
      },
      error: null,
    };
  }

  if (change.content_type === "list") {
    try {
      const parsed = JSON.parse(change.value);
      if (!Array.isArray(parsed)) {
        return {
          row: change,
          error: `리스트 값은 배열 JSON이어야 합니다: ${change.content_key}`,
        };
      }
    } catch {
      return {
        row: change,
        error: `리스트 값 JSON이 올바르지 않습니다: ${change.content_key}`,
      };
    }
  }

  if (change.content_type === "link") {
    const validation = validateEditableHref(change.value, "링크 주소");
    if (validation.error || !validation.value) {
      return {
        row: change,
        error: validation.error ?? `잘못된 링크 주소: ${change.content_key}`,
      };
    }

    return {
      row: {
        ...change,
        value: validation.value,
      },
      error: null,
    };
  }

  if (
    change.content_type === "section" &&
    change.value !== "hidden" &&
    change.value !== "visible"
  ) {
    return {
      row: change,
      error: `섹션 값은 hidden 또는 visible 이어야 합니다: ${change.content_key}`,
    };
  }

  return { row: change, error: null };
}

function revalidatePageContentPages(pages: Iterable<string>) {
  const paths = new Set<string>();

  for (const page of pages) {
    const mappedPaths = PAGE_PATHS[page];
    if (mappedPaths) {
      mappedPaths.forEach((path) => paths.add(path));
      continue;
    }

    paths.add(page === "home" ? "/" : `/${page}`);
  }

  revalidatePath("/", "layout");
  paths.forEach((path) => revalidatePath(path));
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

  const normalizedChanges: ContentChange[] = [];
  for (const change of changes) {
    const normalized = normalizeChange(change);
    if (normalized.error) {
      return { error: normalized.error };
    }
    normalizedChanges.push(normalized.row);
  }

  const { supabase, user } = await getAuthenticatedClient();
  const keys = normalizedChanges.map((change) => change.content_key);
  const { data: beforeRows } = await supabase
    .from("page_content")
    .select("content_key, content_type, value, metadata, page, section")
    .in("content_key", keys);

  const rows = normalizedChanges.map((c) => ({
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

  await logAudit(supabase, "page_content", 0, "bulk_update", {
    payload: {
      before: beforeRows ?? [],
      after: normalizedChanges,
    },
  });

  revalidatePageContentPages(new Set(normalizedChanges.map((c) => c.page)));

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
    return { error: `삭제 실패: ${error.message}` };
  }

  await logAudit(supabase, "page_content", 0, "delete", {
    entityKey: contentKey,
    payload: {
      before: beforeRow,
    },
  });

  if (page) {
    revalidatePageContentPages([page]);
  } else {
    revalidatePageContentPages(["home"]);
  }
  return { error: null };
}

export async function restorePageContentVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<{ error: string | null }> {
  const normalizedPayload =
    payload && typeof payload === "object" ? payload : null;

  if (!normalizedPayload) {
    return { error: "복원할 버전 데이터가 없습니다." };
  }

  const before = Array.isArray(normalizedPayload.before)
    ? normalizedPayload.before
    : normalizedPayload.before && typeof normalizedPayload.before === "object"
      ? [normalizedPayload.before]
      : [];

  if (before.length === 0) {
    return { error: "복원 가능한 이전 데이터가 없습니다." };
  }

  const rows = before
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => ({
      content_key: typeof row.content_key === "string" ? row.content_key : "",
      content_type: typeof row.content_type === "string" ? row.content_type : "",
      value: typeof row.value === "string" ? row.value : "",
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, string>)
          : {},
      page: typeof row.page === "string" ? row.page : "",
      section: typeof row.section === "string" ? row.section : undefined,
    }))
    .filter((row) => row.content_key && row.content_type && row.page);

  if (rows.length === 0) {
    return { error: "복원 가능한 이전 데이터가 없습니다." };
  }

  return savePageContentAction(rows);
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
