import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface PageContent {
  id: string;
  content_key: string;
  content_type: string;
  value: string;
  metadata: Record<string, string>;
  page: string;
  section: string | null;
  updated_at: string;
  updated_by: string;
}

/**
 * Fetch all content overrides for a given page (or all pages).
 * Returns a Map keyed by content_key for O(1) lookups.
 */
export async function getAllPageContent(): Promise<Record<string, PageContent>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .order("content_key");

  if (error || !data) return {};

  const map: Record<string, PageContent> = {};
  for (const row of data) {
    map[row.content_key] = row as PageContent;
  }
  return map;
}

/**
 * Fetch content for a specific page.
 */
export async function getPageContent(page: string): Promise<Record<string, PageContent>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page", page)
    .order("content_key");

  if (error || !data) return {};

  const map: Record<string, PageContent> = {};
  for (const row of data) {
    map[row.content_key] = row as PageContent;
  }
  return map;
}
