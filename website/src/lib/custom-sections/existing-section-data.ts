export const SECTION_THEME_OPTIONS = [
  { id: "default", label: "기본" },
  { id: "paper", label: "화이트" },
  { id: "warm", label: "웜" },
  { id: "mist", label: "미스트" },
] as const;

export const SECTION_SPACING_OPTIONS = [
  { id: "compact", label: "좁게" },
  { id: "normal", label: "보통" },
  { id: "relaxed", label: "넓게" },
] as const;

export type ExistingSectionTheme = (typeof SECTION_THEME_OPTIONS)[number]["id"];
export type ExistingSectionSpacing = (typeof SECTION_SPACING_OPTIONS)[number]["id"];

export interface ExistingSectionStyle {
  id: string;
  theme: ExistingSectionTheme;
  spacing: ExistingSectionSpacing;
}

export function parseExistingSectionOrder(
  rawValue: string | undefined,
  defaultOrder: string[],
): string[] {
  if (!rawValue) return defaultOrder;

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return defaultOrder;

    const parsedIds = parsed.filter((item): item is string => typeof item === "string");
    const nextOrder = parsedIds.filter((id) => defaultOrder.includes(id));
    const missing = defaultOrder.filter((id) => !nextOrder.includes(id));
    return [...nextOrder, ...missing];
  } catch {
    return defaultOrder;
  }
}

export function parseExistingSectionStyles(
  rawValue: string | undefined,
): Record<string, ExistingSectionStyle> {
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return {};

    return Object.fromEntries(
      parsed
        .filter((item): item is Partial<ExistingSectionStyle> => !!item && typeof item === "object")
        .map((item) => [
          typeof item.id === "string" ? item.id : "",
          {
            id: typeof item.id === "string" ? item.id : "",
            theme:
              item.theme === "paper" || item.theme === "warm" || item.theme === "mist"
                ? item.theme
                : "default",
            spacing:
              item.spacing === "compact" || item.spacing === "relaxed"
                ? item.spacing
                : "normal",
          } satisfies ExistingSectionStyle,
        ])
        .filter(([id]) => !!id),
    );
  } catch {
    return {};
  }
}

export function serializeExistingSectionStyles(
  styles: Record<string, ExistingSectionStyle>,
  sectionIds: string[],
): ExistingSectionStyle[] {
  return sectionIds.map((id) => ({
    id,
    theme: styles[id]?.theme ?? "default",
    spacing: styles[id]?.spacing ?? "normal",
  }));
}
