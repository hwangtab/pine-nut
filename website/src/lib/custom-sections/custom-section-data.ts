import { validateEditableHref } from "@/lib/validation/editable-link";
import { validateOptionalImageUrl } from "@/lib/validation/url";
import { randomId } from "@/lib/custom-sections/id";

export interface CustomSectionButton {
  label: string;
  href: string;
}

export interface CustomSection {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  theme: "forest" | "sand" | "paper";
  align: "left" | "center";
  primaryButton: CustomSectionButton;
  secondaryButton: CustomSectionButton;
  visible: boolean;
}

export function createEmptyCustomSection(): CustomSection {
  return {
    id: randomId("section"),
    eyebrow: "새 섹션",
    title: "제목을 입력하세요",
    body: "설명을 입력하세요",
    imageUrl: "",
    imageAlt: "",
    theme: "paper",
    align: "left",
    primaryButton: {
      label: "",
      href: "/",
    },
    secondaryButton: {
      label: "",
      href: "/",
    },
    visible: true,
  };
}

export function parseCustomSections(rawValue: string | undefined): CustomSection[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Partial<CustomSection> => !!item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" && item.id ? item.id : randomId("section"),
        eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : "",
        title: typeof item.title === "string" ? item.title : "",
        body: typeof item.body === "string" ? item.body : "",
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
        imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : "",
        theme:
          item.theme === "forest" || item.theme === "sand" || item.theme === "paper"
            ? item.theme
            : "paper",
        align: item.align === "center" ? "center" : "left",
        primaryButton: {
          label:
            item.primaryButton && typeof item.primaryButton === "object" && typeof item.primaryButton.label === "string"
              ? item.primaryButton.label
              : "",
          href:
            item.primaryButton && typeof item.primaryButton === "object" && typeof item.primaryButton.href === "string"
              ? item.primaryButton.href
              : "/",
        },
        secondaryButton: {
          label:
            item.secondaryButton && typeof item.secondaryButton === "object" && typeof item.secondaryButton.label === "string"
              ? item.secondaryButton.label
              : "",
          href:
            item.secondaryButton && typeof item.secondaryButton === "object" && typeof item.secondaryButton.href === "string"
              ? item.secondaryButton.href
              : "/",
        },
        visible: item.visible !== false,
      }));
  } catch {
    return [];
  }
}

export function validateCustomSections(sections: CustomSection[]): string | null {
  for (const section of sections) {
    if (!section.title.trim()) {
      return "커스텀 섹션 제목을 입력해주세요.";
    }

    if (section.imageUrl.trim()) {
      const imageValidation = validateOptionalImageUrl(section.imageUrl, "섹션 이미지");
      if (imageValidation.error) {
        return imageValidation.error;
      }
    }

    if (section.primaryButton.label.trim()) {
      const hrefValidation = validateEditableHref(
        section.primaryButton.href,
        "기본 버튼 링크",
      );
      if (hrefValidation.error) {
        return hrefValidation.error;
      }
    }

    if (section.secondaryButton.label.trim()) {
      const hrefValidation = validateEditableHref(
        section.secondaryButton.href,
        "보조 버튼 링크",
      );
      if (hrefValidation.error) {
        return hrefValidation.error;
      }
    }
  }

  return null;
}
