export interface ContentChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
}

export type PageContentActionResult = { error: string | null };
