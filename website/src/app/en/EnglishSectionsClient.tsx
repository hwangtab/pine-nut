"use client";

import Link from "next/link";
import { EditableList } from "@/components/editable";

export function EnglishNumbersSection() {
  return (
    <EditableList
      contentKey="en.numbers.stats"
      defaultItems={[
        { number: "7+", label: "Years of resistance" },
        { number: "680+", label: "Weekly protests held" },
        { number: "140+", label: "Organizations in solidarity" },
        { number: "110K+", label: "Pine nut trees at risk" },
      ]}
      page="en"
      section="numbers"
      fields={[
        { key: "number", label: "Number" },
        { key: "label", label: "Label" },
      ]}
    >
      {(items) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 text-center shadow-sm border border-[var(--color-border)]"
            >
              <p className="text-3xl md:text-4xl font-black text-[var(--color-forest)] mb-2">
                {stat.number}
              </p>
              <p className="text-sm md:text-base text-[var(--color-text-muted)] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </EditableList>
  );
}

export function EnglishStakeSection() {
  return (
    <EditableList
      contentKey="en.stake.cards"
      defaultItems={[
        {
          title: "Ecological Destruction",
          description:
            "~110,000 pine nut trees slated for felling across 153 hectares. A 1,800-hectare \"Top 100 Forest\" — home to the goral (natural monument), black woodpecker, and otter — faces permanent destruction.",
        },
        {
          title: "Livelihood Loss",
          description:
            "70% of residents depend on pine nut production. Felling has already begun — 2,256 trees were cut in October 2024 for access road construction. Destroying the forest means destroying their only means of survival.",
        },
        {
          title: "Community Dissolution",
          description:
            "51 households face submersion and forced relocation. 7 residents (ages 60-80) have been criminally charged. Decades-old bonds are being torn apart. Once scattered, this community cannot be rebuilt.",
        },
      ]}
      page="en"
      section="stake"
      fields={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    >
      {(items) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((card, index) => {
            const icons = [
              {
                bgClass: "bg-[var(--color-forest)]/10",
                colorClass: "text-[var(--color-forest)]",
                path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
              },
              {
                bgClass: "bg-[var(--color-earth)]/10",
                colorClass: "text-[var(--color-earth)]",
                path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
              },
              {
                bgClass: "bg-[var(--color-sky)]/10",
                colorClass: "text-[var(--color-sky)]",
                path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
            ];
            const icon = icons[index % icons.length];

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 md:p-8 border border-[var(--color-border)] shadow-sm"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${icon.bgClass} flex items-center justify-center mb-5`}
                >
                  <svg
                    className={`w-6 h-6 ${icon.colorClass}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={icon.path}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {card.title}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed text-[15px]">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </EditableList>
  );
}

export function EnglishHelpCards() {
  return (
    <EditableList
      contentKey="en.help.cards"
      defaultItems={[
        {
          title: "Sign the Petition",
          description:
            "Add your name to the growing list of people demanding the cancellation of this project.",
          linkText: "Go to petition →",
          linkUrl: "/en/petition",
        },
        {
          title: "Share This Story",
          description:
            "Spread the word on social media. The more people know about Pungcheon-ri, the harder it is to ignore.",
          linkText: "Open English share cards →",
          linkUrl: "/en/share",
        },
        {
          title: "Media Inquiries",
          description:
            "Are you a journalist or researcher? We welcome international media coverage of this story.",
          linkText: "Contact via campaign page →",
          linkUrl: "https://campaigns.do/campaigns/1328",
        },
      ]}
      page="en"
      section="help"
      fields={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "linkText", label: "Link Text" },
        { key: "linkUrl", label: "Link URL", type: "url" },
      ]}
    >
      {(items) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left mb-12">
          {items.map((card, index) => (
            <div
              key={index}
              className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15"
            >
              <h3 className="text-lg font-bold mb-3">{card.title}</h3>
              <p className="text-white/70 text-[15px] leading-relaxed mb-5">
                {card.description}
              </p>
              {card.linkUrl && card.linkUrl.startsWith("http") ? (
                <a
                  href={card.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-bold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
                >
                  {card.linkText}
                </a>
              ) : card.linkUrl ? (
                <Link
                  href={card.linkUrl}
                  className="inline-flex items-center text-sm font-bold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
                >
                  {card.linkText}
                </Link>
              ) : (
                <p className="text-sm font-medium text-white/50">{card.linkText}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </EditableList>
  );
}
