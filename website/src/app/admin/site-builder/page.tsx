import SiteBuilderManager from "@/components/admin/SiteBuilderManager";
import {
  BUILDER_PAGES,
  EXISTING_PAGE_SECTIONS,
  GLOBAL_LINK_SETS,
} from "@/lib/custom-sections";
import { getAllPageContent } from "@/lib/data/page-content";

export default async function SiteBuilderPage() {
  const allContent = await getAllPageContent();

  const initialValues = Object.fromEntries([
    [GLOBAL_LINK_SETS.nav, allContent[GLOBAL_LINK_SETS.nav]?.value],
    [GLOBAL_LINK_SETS.footer, allContent[GLOBAL_LINK_SETS.footer]?.value],
    ...BUILDER_PAGES.map((page) => [
      `builder.${page.id}.customSections`,
      allContent[`builder.${page.id}.customSections`]?.value,
    ]),
    ...Object.keys(EXISTING_PAGE_SECTIONS).flatMap((pageId) => [
      [
        `builder.${pageId}.sectionOrder`,
        allContent[`builder.${pageId}.sectionOrder`]?.value,
      ],
      [
        `builder.${pageId}.sectionStyles`,
        allContent[`builder.${pageId}.sectionStyles`]?.value,
      ],
    ]),
  ]) as Record<string, string | undefined>;

  return <SiteBuilderManager initialValues={initialValues} />;
}
