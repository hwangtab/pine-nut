"use client";

import Link from "next/link";
import SubHero from "@/components/SubHero";
import { EditableText, EditableRichText, EditableList, EditableSection } from "@/components/editable";

export default function EnglishPage() {
  return (
    <article>
      {/* ── Hero ── */}
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        title={<EditableText contentKey="en.hero.title" defaultValue="Save Pungcheon-ri" as="span" page="en" section="hero" />}
        subtitle={<EditableText contentKey="en.hero.subtitle" defaultValue="A 7-Year Fight to Protect a Village, a Forest, and a Way of Life" as="span" page="en" section="hero" />}
        eyebrow="English Summary"
      />

      {/* ── The Story ── */}
      <EditableSection contentKey="en.story.visibility" page="en" section="story">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto">
            <EditableText
              contentKey="en.story.title"
              defaultValue="The Story"
              as="h2"
              page="en"
              section="story"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
            />
            <EditableRichText
              contentKey="en.story.body"
              defaultValue={`Pungcheon-ri is a small mountain village in Hongcheon County, Gangwon Province, South Korea, nestled in a 1,800-hectare pine nut forest — the largest in South Korea and one of the Korea Forest Service's designated "Top 100 Forests." Century-old Korean pine nut trees grow along the slopes of Mt. Gari, and the forest is home to endangered species including the goral (natural monument), black woodpecker, and otter. About 70% of residents depend on pine nut production for their livelihoods.

In 2019, Korea Hydro & Nuclear Power (KHNP) selected the area for a 600MW pumped-storage hydroelectric power plant (2 x 300MW) after Hongcheon County applied to host the project. The total cost is 1.59 trillion KRW (~$1.1 billion USD), covering 153 hectares of project area. Construction is contracted to the Daewoo E&C consortium (Daewoo E&C, DL E&C, Hyosung) at 615.5 billion KRW. An estimated ~110,000 pine nut trees are slated for felling, and 51 households face submersion and relocation.

The villagers voted unanimously to oppose the project. Since then, they have held over 680 weekly protests in front of the county office, traveled to Seoul to petition the National Assembly and government ministries, and built alliances with over 140 organizations nationwide.

7 residents (ages 60-80) have been criminally charged with refusal to vacate after a standoff at Hongcheon County Hall in July 2024. Despite the personal cost, they have not backed down. Their fight is conducted entirely through lawful, democratic means.`}
              page="en"
              section="story"
              className="space-y-6 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            >
              {(value) => (
                <div className="space-y-6 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
                  {value.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </EditableRichText>
          </div>
        </section>
      </EditableSection>

      {/* ── By the Numbers ── */}
      <EditableSection contentKey="en.numbers.visibility" page="en" section="numbers">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
          <div className="max-w-4xl mx-auto">
            <EditableText
              contentKey="en.numbers.title"
              defaultValue="By the Numbers"
              as="h2"
              page="en"
              section="numbers"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
            />
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
                  {items.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm border border-[var(--color-border)]"
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
          </div>
        </section>
      </EditableSection>

      {/* ── What's at Stake ── */}
      <EditableSection contentKey="en.stake.visibility" page="en" section="stake">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
          <div className="max-w-4xl mx-auto">
            <EditableText
              contentKey="en.stake.title"
              defaultValue="What's at Stake"
              as="h2"
              page="en"
              section="stake"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
            />
            <EditableList
              contentKey="en.stake.cards"
              defaultItems={[
                {
                  title: "Ecological Destruction",
                  description: "~110,000 pine nut trees slated for felling across 153 hectares. A 1,800-hectare \"Top 100 Forest\" — home to the goral (natural monument), black woodpecker, and otter — faces permanent destruction.",
                },
                {
                  title: "Livelihood Loss",
                  description: "70% of residents depend on pine nut production. Felling has already begun — 2,256 trees were cut in October 2024 for access road construction. Destroying the forest means destroying their only means of survival.",
                },
                {
                  title: "Community Dissolution",
                  description: "51 households face submersion and forced relocation. 7 residents (ages 60-80) have been criminally charged. Decades-old bonds are being torn apart. Once scattered, this community cannot be rebuilt.",
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
                  {items.map((card, i) => {
                    const icons = [
                      { bgClass: "bg-[var(--color-forest)]/10", colorClass: "text-[var(--color-forest)]", path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                      { bgClass: "bg-[var(--color-earth)]/10", colorClass: "text-[var(--color-earth)]", path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
                      { bgClass: "bg-[var(--color-sky)]/10", colorClass: "text-[var(--color-sky)]", path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                    ];
                    const icon = icons[i % icons.length];
                    return (
                      <div key={i} className="bg-white rounded-2xl p-8 border border-[var(--color-border)] shadow-sm">
                        <div className={`w-12 h-12 rounded-xl ${icon.bgClass} flex items-center justify-center mb-5`}>
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
          </div>
        </section>
      </EditableSection>

      {/* ── How You Can Help ── */}
      <EditableSection contentKey="en.help.visibility" page="en" section="help">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <EditableText
              contentKey="en.help.title"
              defaultValue="How You Can Help"
              as="h2"
              page="en"
              section="help"
              className="text-3xl md:text-4xl font-black mb-6"
            />
            <EditableText
              contentKey="en.help.subtitle"
              defaultValue="International attention can make a difference. Here is how you can support the residents of Pungcheon-ri."
              as="p"
              page="en"
              section="help"
              className="text-white/80 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto"
            />

            <EditableList
              contentKey="en.help.cards"
              defaultItems={[
                {
                  title: "Sign the Petition",
                  description: "Add your name to the growing list of people demanding the cancellation of this project.",
                  linkText: "Go to petition →",
                  linkUrl: "/petition",
                },
                {
                  title: "Share This Story",
                  description: "Spread the word on social media. The more people know about Pungcheon-ri, the harder it is to ignore.",
                  linkText: "Share the link to this page",
                  linkUrl: "",
                },
                {
                  title: "Media Inquiries",
                  description: "Are you a journalist or researcher? We welcome international media coverage of this story.",
                  linkText: "Contact via campaign page",
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
                  {items.map((card, i) => (
                    <div key={i} className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15">
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
                        <p className="text-sm font-medium text-white/50">
                          {card.linkText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </EditableList>

            <Link
              href="/petition"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
            >
              <EditableText contentKey="en.cta.button" defaultValue="Sign the Petition" as="span" page="en" section="help" />
            </Link>
          </div>
        </section>
      </EditableSection>
    </article>
  );
}
