export interface ContentChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
  /**
   * 편집을 시작할 때 화면에 있던 DB 값(없었으면 null).
   * 저장 시점의 DB 값과 다르면 그 사이 다른 관리자가 먼저 저장한 것이므로
   * 덮어쓰지 않고 충돌을 알린다.
   */
  base_value?: string | null;
}

export type PageContentActionResult = { error: string | null };
