"use client";

import UtilityHeader from "@/components/UtilityHeader";
import { SITE_HOST } from "@/lib/site-config";
import { events } from "@/lib/analytics";
import { EditableLink, EditableList, EditableRichText, EditableText } from "@/components/editable";

const damageItems = [
  { label: "Forest destruction", description: "A 1,800-hectare pine nut forest recognized as one of Korea's Top 100 Forests would be damaged, with about 110,000 pine trees at risk." },
  { label: "Ecological loss", description: "Habitat used by the goral, black woodpecker, otter, and other species would be fragmented or destroyed." },
  { label: "Livelihood collapse", description: "Fifty-one households face submersion and relocation, while about 70% of residents rely on pine nut production." },
  { label: "Community breakup", description: "A multi-generational mountain village community would be scattered." },
  { label: "Health impacts", description: "Noise, dust, and vibration from long-term construction would affect mostly elderly residents." },
];

const demandItems = [
  { text: "Full cancellation of the Hongcheon pumped-storage power plant plan" },
  { text: "Permanent protection of the pine forest and ecosystem in Pungcheon-ri" },
  { text: "An end to one-sided project implementation that ignores resident opposition" },
  { text: "Meaningful dialogue with residents and a broader discussion of alternative energy policy" },
];

export default function EnglishPressReleasePage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="no-print">
        <UtilityHeader
          title={<EditableText contentKey="en.press.release.header.title" defaultValue="Press Release" as="span" page="en/press" section="release" />}
          subtitle={<EditableText contentKey="en.press.release.header.subtitle" defaultValue="Residents of Pungcheon-ri call for the cancellation of the pumped-storage plant" as="span" page="en/press" section="release" />}
          eyebrow={<EditableText contentKey="en.press.release.header.eyebrow" defaultValue="Press Release" as="span" page="en/press" section="release" />}
          tone="slate"
        />
      </div>

      <div className="print-page max-w-3xl mx-auto px-6 py-12">
        <div className="no-print mb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              events.pressKitDownload("release_en");
              window.print();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-forest)] text-white font-semibold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <EditableText contentKey="en.press.release.pdf" defaultValue="Save as PDF" as="span" page="en/press" section="release" />
          </button>
          <EditableLink contentKey="en.press.release.backHref" defaultHref="/en/press" page="en/press" section="release" className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors">
            <EditableText contentKey="en.press.release.back" defaultValue="Back to press kit" as="span" page="en/press" section="release" />
          </EditableLink>
        </div>

        <header className="mb-10 border-b-2 border-[var(--color-forest)] pb-6">
          <EditableText contentKey="en.press.release.eyebrow" defaultValue="Press Release" as="p" page="en/press" section="release" className="text-sm font-semibold text-[var(--color-forest)] tracking-wider uppercase mb-2" />
          <EditableText contentKey="en.press.release.headline" defaultValue="Residents of Pungcheon-ri call for the cancellation of the pumped-storage power plant" as="h1" page="en/press" section="release" className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] leading-tight mb-4" />
          <div className="text-sm text-[var(--color-text-muted)] space-y-1">
            <EditableText contentKey="en.press.release.date" defaultValue="Issued: March 2026" as="p" page="en/press" section="release" />
            <EditableText contentKey="en.press.release.sender" defaultValue="From: Pungcheon-ri Residents Committee" as="p" page="en/press" section="release" />
            <EditableText contentKey="en.press.release.contactInfo" defaultValue="Contact: 010-8918-8933 (Lee Chang-hoo, campaign coordinator)" as="p" page="en/press" section="release" />
          </div>
        </header>

        <section className="mb-8">
          <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
            <EditableRichText
              contentKey="en.press.release.lead"
              defaultValue="[Hongcheon, South Korea] Residents of Pungcheon-ri in Hongcheon County, Gangwon Province, are calling for the full cancellation of the pumped-storage power plant proposed by Korea Hydro & Nuclear Power. Since the first protest in March 2019, residents have continued weekly resistance for more than seven years, making the struggle one of South Korea's most sustained community environmental campaigns."
              page="en/press"
              section="release"
            >
              {(value) => <p className="text-base text-[var(--color-text)] leading-relaxed font-medium">{value}</p>}
            </EditableRichText>
          </div>
        </section>

        <section className="mb-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Project Overview</h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
              The Hongcheon pumped-storage plant is a 600MW project proposed by KHNP in Pungcheon-ri, with a total budget of about 1.5863 trillion KRW and a footprint of roughly 153 hectares. Construction is assigned to the Daewoo E&C consortium.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Seven Years of Resistance</h2>
            <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
              Residents have opposed the project unanimously since March 2019. More than 680 weekly protests later, the campaign has become exceptional in South Korea&apos;s environmental movement, especially because many residents are in their 60s, 70s, and 80s.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Expected Damage</h2>
            <EditableList contentKey="en.press.release.damageItems" defaultItems={damageItems} page="en/press" section="release" fields={[{ key: "label", label: "Label" }, { key: "description", label: "Description", type: "textarea" }]}>
              {(items) => (
                <ul className="space-y-2 text-base text-[var(--color-text-muted)] leading-relaxed">
                  {items.map((item, index) => (
                    <li key={index}>
                      <strong>{item.label}:</strong> {item.description}
                    </li>
                  ))}
                </ul>
              )}
            </EditableList>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Resident Demands</h2>
            <EditableList contentKey="en.press.release.demandItems" defaultItems={demandItems} page="en/press" section="release" fields={[{ key: "text", label: "Demand" }]}>
              {(items) => (
                <ol className="space-y-2 text-base text-[var(--color-text-muted)] leading-relaxed list-decimal list-inside">
                  {items.map((item, index) => (
                    <li key={index}>{item.text}</li>
                  ))}
                </ol>
              )}
            </EditableList>
          </div>
        </section>

        <section className="mb-8">
          <blockquote className="border-l-4 border-[var(--color-forest)] pl-5 py-3 bg-[var(--color-bg)] rounded-r-xl">
            <p className="text-base text-[var(--color-text)] leading-relaxed italic">
              &ldquo;We were born with this forest and have lived with it all our lives. If 110,000 pine trees are cut, our lives are being uprooted with them. We have protested more than 680 times, and we will not stop now.&rdquo;
            </p>
            <cite className="text-sm text-[var(--color-text-muted)] mt-2 block not-italic">Pungcheon-ri Residents Committee</cite>
          </blockquote>
        </section>

        <footer className="pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Pungcheon-ri Residents Committee | {SITE_HOST}/en | March 2026
          </p>
        </footer>
      </div>
    </>
  );
}
