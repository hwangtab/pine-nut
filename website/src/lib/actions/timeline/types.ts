export interface ValidatedTimelineForm {
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
}
