"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  type BuilderPageId,
  parseCustomSections,
} from "@/lib/custom-sections";
import {
  isExternalEditableHref,
  isInternalEditableHref,
} from "@/lib/validation/editable-link";

const PATH_TO_PAGE: Record<string, BuilderPageId> = {
  "/": "home",
  "/story": "story",
  "/timeline": "timeline",
  "/news": "news",
  "/press": "press",
  "/petition": "petition",
  "/donate": "donate",
  "/share": "share",
  "/gallery": "gallery",
  "/privacy": "privacy",
  "/en": "en",
};

function renderSectionLink(
  href: string,
  className: string,
  label: string,
) {
  if (isInternalEditableHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target={isExternalEditableHref(href) ? "_blank" : undefined}
      rel={isExternalEditableHref(href) ? "noopener noreferrer" : undefined}
    >
      {label}
    </a>
  );
}

export default function CustomSectionsHost() {
  const pathname = usePathname();
  const { getContent } = useAdminEdit();
  const page = PATH_TO_PAGE[pathname];

  if (!page) return null;

  const sections = parseCustomSections(
    getContent(`builder.${page}.customSections`),
  ).filter((section) => section.visible);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-0">
      {sections.map((section) => {
        const isForest = section.theme === "forest";
        const isSand = section.theme === "sand";
        const sectionClassName = isForest
          ? "bg-[var(--color-forest)] text-white"
          : isSand
            ? "bg-[var(--color-bg-warm)] text-[var(--color-text)]"
            : "bg-white text-[var(--color-text)]";
        const mutedClassName = isForest ? "text-white/80" : "text-[var(--color-text-muted)]";
        const secondaryClassName = isForest
          ? "border-white/40 text-white hover:bg-white/10"
          : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]";

        return (
          <section
            key={section.id}
            className={`border-t border-[var(--color-border)]/50 ${sectionClassName}`}
          >
            <div
              className={`mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 ${
                section.imageUrl
                  ? section.align === "center"
                    ? "grid-cols-1"
                    : "grid-cols-1 items-center lg:grid-cols-[1.2fr_0.8fr]"
                  : "grid-cols-1"
              }`}
            >
              <div className={section.align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
                {section.eyebrow && (
                  <p className={`mb-3 text-sm font-semibold tracking-[0.2em] uppercase ${mutedClassName}`}>
                    {section.eyebrow}
                  </p>
                )}
                <h2 className="text-3xl font-black leading-tight md:text-4xl break-words">
                  {section.title}
                </h2>
                {section.body && (
                  <div className={`mt-5 space-y-4 text-base leading-relaxed md:text-lg ${mutedClassName}`}>
                    {section.body.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
                {(section.primaryButton.label || section.secondaryButton.label) && (
                  <div
                    className={`mt-8 flex flex-wrap gap-3 ${
                      section.align === "center" ? "justify-center" : ""
                    }`}
                  >
                    {section.primaryButton.label &&
                      renderSectionLink(
                        section.primaryButton.href,
                        `inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                          isForest
                            ? "bg-white text-[var(--color-forest)] hover:bg-white/90"
                            : "bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-light)]"
                        }`,
                        section.primaryButton.label,
                      )}
                    {section.secondaryButton.label &&
                      renderSectionLink(
                        section.secondaryButton.href,
                        `inline-flex min-h-[48px] items-center justify-center rounded-xl border px-6 py-3 text-sm font-bold transition-colors ${secondaryClassName}`,
                        section.secondaryButton.label,
                      )}
                  </div>
                )}
              </div>

              {section.imageUrl && section.align !== "center" && (
                <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 shadow-xl">
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt || section.title}
                    width={960}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {section.imageUrl && section.align === "center" && (
                <div className="mx-auto mt-2 max-w-4xl overflow-hidden rounded-3xl border border-[var(--color-border)]/60 shadow-xl">
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt || section.title}
                    width={1200}
                    height={840}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
