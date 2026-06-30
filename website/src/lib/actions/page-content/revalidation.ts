import { revalidatePath } from "next/cache";

const PUBLIC_PAGE_PATHS = [
  "/",
  "/_not-found",
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
  "not-found": ["/_not-found"],
  nav: PUBLIC_PAGE_PATHS,
  footer: PUBLIC_PAGE_PATHS,
};

export function revalidatePageContentPages(pages: Iterable<string>) {
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
