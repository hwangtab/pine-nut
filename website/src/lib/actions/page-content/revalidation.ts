import { revalidatePath, revalidateTag } from "next/cache";
import { PAGE_CONTENT_CACHE_TAG } from "@/lib/data/page-content";

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

  // 루트 레이아웃이 읽는 CMS 오버라이드 캐시부터 버린다. 이걸 빠뜨리면
  // revalidatePath로 페이지를 다시 렌더해도 레이아웃이 캐시된 옛 값을 그대로
  // 다시 집어넣어, 관리자가 저장한 문구가 만료(1시간) 전까지 화면에 안 나온다.
  //
  // { expire: 0 }은 즉시 만료다. 기본값인 stale-while-revalidate('max')를 쓰면
  // 저장 직후 한 번은 옛 값이 그대로 돌아온다 — 방금 자기 손으로 고친 문구가
  // 안 바뀐 것처럼 보이면 관리자는 저장이 실패했다고 판단하고 다시 저장한다.
  revalidateTag(PAGE_CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  paths.forEach((path) => revalidatePath(path));
}
