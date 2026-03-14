"use client";

import UtilityHeader from "@/components/UtilityHeader";
import { SITE_HOST } from "@/lib/site-config";
import { events } from "@/lib/analytics";
import { EditableLink, EditableList, EditableRichText, EditableText } from "@/components/editable";

const factSheetData = [
  { label: "Location", value: "Pungcheon-ri, Hongcheon County, Gangwon Province, South Korea" },
  { label: "Developer", value: "Korea Hydro & Nuclear Power (KHNP)" },
  { label: "Main contractor", value: "Daewoo E&C consortium" },
  { label: "Plant size", value: "600MW (300MW x 2 units)" },
  { label: "Project area", value: "1,530,279 square meters (about 153 hectares)" },
  { label: "Total budget", value: "1.5863 trillion KRW" },
  { label: "Pine trees at risk", value: "About 110,000 trees" },
  { label: "Pine forest", value: "1,800 hectares, designated as one of Korea's Top 100 Forests" },
  { label: "Households affected", value: "51 households" },
  { label: "Livelihood reliance", value: "Around 70% of residents rely on pine nut production" },
  { label: "Endangered species", value: "Goral, black woodpecker, otter" },
  { label: "Length of struggle", value: "March 2019 to present" },
  { label: "Weekly protests", value: "680+" },
  { label: "Resident position", value: "Unanimous opposition" },
];

const keyNumbers = [
  { number: "680+", label: "Weekly protests" },
  { number: "110K", label: "Pine trees at risk" },
  { number: "51", label: "Households affected" },
  { number: "7+", label: "Years of resistance" },
];

export default function EnglishFactsheetPage() {
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
          title={<EditableText contentKey="en.press.factsheet.header.title" defaultValue="Fact Sheet" as="span" page="en/press" section="factsheet" />}
          subtitle={<EditableText contentKey="en.press.factsheet.header.subtitle" defaultValue="Key facts about the struggle in Pungcheon-ri" as="span" page="en/press" section="factsheet" />}
          eyebrow={<EditableText contentKey="en.press.factsheet.header.eyebrow" defaultValue="Fact Sheet" as="span" page="en/press" section="factsheet" />}
          tone="slate"
        />
      </div>

      <div className="print-page max-w-3xl mx-auto px-6 py-12">
        <div className="no-print mb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              events.pressKitDownload("factsheet_en");
              window.print();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-forest)] text-white font-semibold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <EditableText contentKey="en.press.factsheet.pdf" defaultValue="Save as PDF" as="span" page="en/press" section="factsheet" />
          </button>
          <EditableLink contentKey="en.press.factsheet.backHref" defaultHref="/en/press" page="en/press" section="factsheet" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors">
            <EditableText contentKey="en.press.factsheet.back" defaultValue="Back to press kit" as="span" page="en/press" section="factsheet" />
          </EditableLink>
        </div>

        <header className="mb-10 border-b-2 border-[var(--color-forest)] pb-6">
          <p className="text-sm font-semibold text-[var(--color-forest)] tracking-wider uppercase mb-2">Fact Sheet</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] leading-tight mb-3">
            Save Pungcheon-ri
            <br />
            Key Facts
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Published by the Pungcheon-ri Residents&apos; Committee | March 2026
          </p>
        </header>

        <section className="mb-8">
          <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
            <EditableRichText
              contentKey="en.press.factsheet.summary"
              defaultValue="Residents of Pungcheon-ri in Hongcheon County, South Korea, have resisted KHNP's pumped-storage power plant plan since 2019. The project threatens a protected 1,800-hectare pine nut forest, around 110,000 pine trees, and the homes and livelihoods of 51 households."
              page="en/press"
              section="factsheet"
            >
              {(value) => <p className="text-base text-[var(--color-text)] leading-relaxed">{value}</p>}
            </EditableRichText>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Project Snapshot</h2>
          <EditableList contentKey="en.press.factsheet.items" defaultItems={factSheetData} page="en/press" section="factsheet" fields={[{ key: "label", label: "Label" }, { key: "value", label: "Value" }]}>
            {(items) => (
              <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
                <div className="divide-y divide-[var(--color-border)]">
                  {items.map((fact, index) => (
                    <div key={fact.label} className={`flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-1 sm:gap-4 ${index % 2 === 0 ? "bg-white" : "bg-[var(--color-bg)]"}`}>
                      <dt className="text-sm font-bold text-[var(--color-forest)] sm:w-44 shrink-0">
                        {fact.label}
                      </dt>
                      <dd className="text-sm text-[var(--color-text)] font-medium">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </EditableList>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Key Numbers</h2>
          <EditableList contentKey="en.press.factsheet.keyNumbers" defaultItems={keyNumbers} page="en/press" section="factsheet" fields={[{ key: "number", label: "Number" }, { key: "label", label: "Label" }]}>
            {(items) => (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {items.map((item) => (
                  <div key={item.label} className="text-center p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    <p className="text-2xl font-extrabold text-[var(--color-forest)]">{item.number}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </EditableList>
        </section>

        <footer className="pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Save Pungcheon-ri | {SITE_HOST}/en | March 2026
          </p>
        </footer>
      </div>
    </>
  );
}
