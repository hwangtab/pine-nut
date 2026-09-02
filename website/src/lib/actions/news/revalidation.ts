import { revalidatePath } from "next/cache";

export function revalidateNewsPaths(...slugs: Array<string | null | undefined>) {
  revalidatePath("/news");
  [...new Set(slugs.filter((slug): slug is string => !!slug))].forEach((slug) => {
    revalidatePath(`/news/${slug}`);
  });
  revalidatePath("/admin/news");
  revalidatePath("/admin/history");
  // sitemap은 발행된 기사 목록을 담고, 더 이상 요청마다 새로 만들어지지 않는다
  // (공개 조회가 쿠키를 읽지 않게 되면서 정적 프리렌더 대상이 됐다). 여기서
  // 같이 무효화하지 않으면 새 기사가 색인 대상에서 빠진 채로 굳는다.
  revalidatePath("/sitemap.xml");
}
