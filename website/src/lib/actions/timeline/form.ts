import { validateOptionalImageUrl } from "@/lib/validation/url";
import type { ValidatedTimelineForm } from "@/lib/actions/timeline/types";

const TIMELINE_CATEGORIES = ["회의", "집회", "법률", "연대", "기타"];

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

// "2024년 3월" 같은 자유 형식에서 연도를 뽑는다. 연도로 볼 수 없는 4자리 숫자
// (예: "주민 1500명 집회")를 연도로 오인하지 않도록 19xx/20xx로 좁히고,
// 어느 것도 못 찾으면 현재 연도로 얼버무리지 않고 null을 돌려준다.
function extractYearFromDate(dateText: string): number | null {
  const match = dateText.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const year = parseInt(match[0], 10);
  return year >= MIN_YEAR && year <= MAX_YEAR ? year : null;
}

export function validateTimelineForm(
  formData: FormData,
): { data: ValidatedTimelineForm | null; error: string | null } {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const date = (formData.get("date") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const category = formData.get("category") as string;
  const sortOrderStr = formData.get("sort_order") as string;
  const imageAlt = (formData.get("image_alt") as string)?.trim() || null;

  if (!title) return { data: null, error: "제목을 입력해주세요." };
  if (title.length > 200) return { data: null, error: "제목은 200자 이내로 입력해주세요." };
  if (!description) return { data: null, error: "설명을 입력해주세요." };
  if (!date) return { data: null, error: "날짜를 입력해주세요." };
  if (!category || !TIMELINE_CATEGORIES.includes(category)) {
    return { data: null, error: "분류를 선택해주세요." };
  }

  // 날짜 텍스트에서 읽은 연도를 우선한다. hidden year를 우선하면 수정 화면에서
  // 날짜를 바꿔도 예전 연도가 그대로 재전송되어 연도별 필터에서 엉뚱한 곳에 남는다.
  const parsedYear = parseInt(yearStr, 10);
  const fallbackYear =
    !isNaN(parsedYear) && parsedYear >= MIN_YEAR && parsedYear <= MAX_YEAR ? parsedYear : null;
  const year = extractYearFromDate(date) ?? fallbackYear;
  if (year === null) {
    return { data: null, error: "날짜에서 연도를 인식하지 못했습니다. 예: 2026년 3월" };
  }

  const sortOrder = parseInt(sortOrderStr, 10) || 0;

  const imageUrlValidation = validateOptionalImageUrl(
    formData.get("image_url") as string,
    "사진 주소",
  );
  if (imageUrlValidation.error) return { data: null, error: imageUrlValidation.error };

  return {
    data: {
      date,
      year,
      title,
      description,
      category,
      imageUrl: imageUrlValidation.value,
      imageAlt,
      sortOrder,
    },
    error: null,
  };
}

export function friendlyTimelineError(message: string): string {
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}
