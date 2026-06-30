import type { BuilderPageId } from "@/lib/custom-sections";

export const PAGE_PREVIEW_PATHS: Partial<Record<BuilderPageId, string>> = {
  home: "/",
  story: "/story",
  timeline: "/timeline",
  news: "/news",
  press: "/press",
  petition: "/petition",
  donate: "/donate",
  share: "/share",
  gallery: "/gallery",
  privacy: "/privacy",
  en: "/en",
};
