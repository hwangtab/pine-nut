import {
  BUILDER_PAGES,
  EXISTING_PAGE_SECTIONS,
  GLOBAL_LINK_SETS,
  defaultFooterLinks,
  defaultNavLinks,
  parseBuilderLinks,
  parseCustomSections,
  parseExistingSectionOrder,
  parseExistingSectionStyles,
  type BuilderLinkItem,
  type BuilderPageId,
  type CustomSection,
  type ExistingSectionStyle,
} from "@/lib/custom-sections";

export type SiteBuilderInitialValues = Record<string, string | undefined>;
export type SectionsByPage = Record<BuilderPageId, CustomSection[]>;
export type SectionOrdersByPage = Record<BuilderPageId, string[]>;
export type SectionStylesByPage = Record<
  BuilderPageId,
  Record<string, ExistingSectionStyle>
>;

export function createInitialNavLinks(
  initialValues: SiteBuilderInitialValues,
): BuilderLinkItem[] {
  return parseBuilderLinks(
    initialValues[GLOBAL_LINK_SETS.nav],
    defaultNavLinks(),
  );
}

export function createInitialFooterLinks(
  initialValues: SiteBuilderInitialValues,
): BuilderLinkItem[] {
  return parseBuilderLinks(
    initialValues[GLOBAL_LINK_SETS.footer],
    defaultFooterLinks(),
  );
}

export function createInitialSectionsByPage(
  initialValues: SiteBuilderInitialValues,
): SectionsByPage {
  return Object.fromEntries(
    BUILDER_PAGES.map((page) => [
      page.id,
      parseCustomSections(initialValues[`builder.${page.id}.customSections`]),
    ]),
  ) as SectionsByPage;
}

export function createInitialSectionOrdersByPage(
  initialValues: SiteBuilderInitialValues,
): SectionOrdersByPage {
  return Object.fromEntries(
    BUILDER_PAGES.map((page) => {
      const defaultOrder =
        EXISTING_PAGE_SECTIONS[page.id]?.map((section) => section.id) ?? [];

      return [
        page.id,
        parseExistingSectionOrder(
          initialValues[`builder.${page.id}.sectionOrder`],
          defaultOrder,
        ),
      ];
    }),
  ) as SectionOrdersByPage;
}

export function createInitialSectionStylesByPage(
  initialValues: SiteBuilderInitialValues,
): SectionStylesByPage {
  return Object.fromEntries(
    BUILDER_PAGES.map((page) => [
      page.id,
      parseExistingSectionStyles(
        initialValues[`builder.${page.id}.sectionStyles`],
      ),
    ]),
  ) as SectionStylesByPage;
}
