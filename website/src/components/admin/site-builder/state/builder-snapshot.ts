import {
  BUILDER_PAGES,
  GLOBAL_LINK_SETS,
  type BuilderLinkItem,
} from "@/lib/custom-sections";
import type {
  SectionOrdersByPage,
  SectionStylesByPage,
  SectionsByPage,
} from "./initial-site-builder-state";

export interface BuilderSnapshotInput {
  navLinks: BuilderLinkItem[];
  footerLinks: BuilderLinkItem[];
  sectionsByPage: SectionsByPage;
  sectionOrdersByPage: SectionOrdersByPage;
  sectionStylesByPage: SectionStylesByPage;
}

/** content_key 별 편집 상태 직렬화. 저장 안 된 변경이 있는지 비교하는 용도로만 쓴다. */
export type BuilderSnapshot = Record<string, string>;

export function snapshotBuilderState({
  navLinks,
  footerLinks,
  sectionsByPage,
  sectionOrdersByPage,
  sectionStylesByPage,
}: BuilderSnapshotInput): BuilderSnapshot {
  const snapshot: BuilderSnapshot = {
    [GLOBAL_LINK_SETS.nav]: JSON.stringify(navLinks),
    [GLOBAL_LINK_SETS.footer]: JSON.stringify(footerLinks),
  };

  for (const page of BUILDER_PAGES) {
    snapshot[`builder.${page.id}.customSections`] = JSON.stringify(
      sectionsByPage[page.id] ?? [],
    );
    snapshot[`builder.${page.id}.sectionOrder`] = JSON.stringify(
      sectionOrdersByPage[page.id] ?? [],
    );
    snapshot[`builder.${page.id}.sectionStyles`] = JSON.stringify(
      sectionStylesByPage[page.id] ?? {},
    );
  }

  return snapshot;
}

export function hasSnapshotChanges(
  saved: BuilderSnapshot,
  current: BuilderSnapshot,
): boolean {
  return Object.keys(current).some((key) => saved[key] !== current[key]);
}

export function pickSnapshotKeys(
  snapshot: BuilderSnapshot,
  keys: string[],
): BuilderSnapshot {
  return Object.fromEntries(keys.map((key) => [key, snapshot[key]]));
}
