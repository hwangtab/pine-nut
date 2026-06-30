export interface ValidatedNewsForm {
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  sourceUrl: string;
  sourceName: string;
  thumbnailUrl: string | null;
}
