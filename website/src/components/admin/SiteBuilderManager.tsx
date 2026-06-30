"use client";

import BuilderLinkEditor from "@/components/admin/site-builder/BuilderLinkEditor";
import CustomSectionsEditor from "@/components/admin/site-builder/CustomSectionsEditor";
import ExistingSectionsEditor from "@/components/admin/site-builder/ExistingSectionsEditor";
import SiteBuilderOverview from "@/components/admin/site-builder/SiteBuilderOverview";
import SiteBuilderSpecialPagesNotice from "@/components/admin/site-builder/SiteBuilderSpecialPagesNotice";
import SiteBuilderStatusMessage from "@/components/admin/site-builder/SiteBuilderStatusMessage";
import useSiteBuilderState from "@/components/admin/site-builder/useSiteBuilderState";

interface SiteBuilderManagerProps {
  initialValues: Record<string, string | undefined>;
}

export default function SiteBuilderManager({
  initialValues,
}: SiteBuilderManagerProps) {
  const builder = useSiteBuilderState(initialValues);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">사이트 빌더</h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          글로벌 링크와 페이지별 커스텀 섹션을 코드 수정 없이 관리합니다.
        </p>
      </div>

      <SiteBuilderOverview
        selectedPageLabel={builder.selectedPageMeta?.label}
        previewPath={builder.previewPath}
      />

      <SiteBuilderStatusMessage
        saveMessage={builder.saveMessage}
        saveError={builder.saveError}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <BuilderLinkEditor
          title="내비게이션 링크"
          items={builder.navLinks}
          setItems={builder.setNavLinks}
        />
        <BuilderLinkEditor
          title="푸터 빠른 링크"
          items={builder.footerLinks}
          setItems={builder.setFooterLinks}
        />
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={builder.saveGlobalLinks}
          disabled={builder.isPending}
          className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
        >
          {builder.isPending ? "저장 중..." : "글로벌 링크 저장"}
        </button>
      </div>

      <SiteBuilderSpecialPagesNotice />

      <CustomSectionsEditor
        selectedPage={builder.selectedPage}
        setSelectedPage={builder.setSelectedPage}
        sections={builder.sections}
        setSectionsByPage={builder.setSectionsByPage}
        onSave={builder.saveSections}
        isPending={builder.isPending}
      />

      <ExistingSectionsEditor
        existingSections={builder.existingSections}
        selectedPage={builder.selectedPage}
        currentSectionOrder={builder.currentSectionOrder}
        currentSectionStyles={builder.currentSectionStyles}
        setSectionOrdersByPage={builder.setSectionOrdersByPage}
        setSectionStylesByPage={builder.setSectionStylesByPage}
        onSave={builder.saveExistingSections}
        isPending={builder.isPending}
      />
    </div>
  );
}
