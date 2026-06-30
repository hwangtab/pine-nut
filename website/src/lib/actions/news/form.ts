import { fetchOgImage } from "@/lib/og-image";
import { validateOptionalImageUrl, validateOptionalSourceUrl } from "@/lib/validation/url";
import type { ValidatedNewsForm } from "@/lib/actions/news/types";

const NEWS_CATEGORIES = ["공지", "집회", "언론보도", "연대"];

function generateSlug(date: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `news-${date}-${random}`;
}

export function validateNewsForm(
  formData: FormData,
): { data: ValidatedNewsForm | null; error: string | null } {
  const rawSlug = (formData.get("slug") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;
  const sourceName = (formData.get("source_name") as string)?.trim() || "";

  if (!title) return { data: null, error: "제목을 입력해주세요." };
  if (title.length > 200) return { data: null, error: "제목은 200자 이내로 입력해주세요." };
  if (!summary) return { data: null, error: "요약을 입력해주세요." };
  if (!content) return { data: null, error: "본문을 입력해주세요." };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { data: null, error: "올바른 날짜를 선택해주세요." };
  }
  if (!category || !NEWS_CATEGORIES.includes(category)) {
    return { data: null, error: "분류를 선택해주세요." };
  }

  const slug = rawSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)
    ? rawSlug
    : generateSlug(date);

  const sourceUrlValidation = validateOptionalSourceUrl(formData.get("source_url") as string);
  if (sourceUrlValidation.error) return { data: null, error: sourceUrlValidation.error };

  const thumbnailUrlValidation = validateOptionalImageUrl(
    formData.get("thumbnail_url") as string,
    "썸네일 이미지 URL",
  );
  if (thumbnailUrlValidation.error) {
    return { data: null, error: thumbnailUrlValidation.error };
  }

  return {
    data: {
      slug,
      title,
      summary,
      content,
      date,
      category,
      sourceUrl: sourceUrlValidation.value ?? "",
      sourceName,
      thumbnailUrl: thumbnailUrlValidation.value,
    },
    error: null,
  };
}

export function friendlyNewsError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해주세요.";
  }
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}

export async function resolveThumbnailUrl(
  thumbnailUrl: string | null,
  sourceUrl: string,
): Promise<string | null> {
  if (thumbnailUrl || !sourceUrl) {
    return thumbnailUrl;
  }

  const fetchedOgImage = await fetchOgImage(sourceUrl);
  if (!fetchedOgImage) {
    return null;
  }

  const ogImageValidation = validateOptionalImageUrl(fetchedOgImage, "OG 이미지 URL");
  if (ogImageValidation.error) {
    return null;
  }

  return ogImageValidation.value;
}
