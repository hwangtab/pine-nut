import type { Metadata } from "next";
import Link from "next/link";
import SubHero from "@/components/SubHero";

export const metadata: Metadata = {
  title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
  description:
    "Elderly villagers in Pungcheon-ri, South Korea, are fighting to protect their pine nut forests and community from a destructive pumped-storage power plant.",
  openGraph: {
    title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
    description:
      "A 7-year fight to protect a village, a forest, and a way of life. Learn how you can help.",
    type: "website",
    locale: "en_US",
  },
};

export default function EnglishPage() {
  return (
    <article>
      {/* ── Hero ── */}
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        title="Save Pungcheon-ri"
        subtitle="A 7-Year Fight to Protect a Village, a Forest, and a Way of Life"
        above={<p className="text-sm uppercase tracking-widest text-white/60 mb-4 font-medium">English Summary</p>}
      />

      {/* ── The Story ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10">
            The Story
          </h2>
          <div className="space-y-6 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
            <p>
              Pungcheon-ri is a small mountain village in{" "}
              <strong>Hongcheon County, Gangwon Province, South Korea</strong>,
              nestled in a{" "}
              <strong>1,800-hectare pine nut forest</strong> — the largest
              in South Korea and one of the Korea Forest Service's
              designated "Top 100 Forests." Century-old Korean pine
              nut trees grow along the slopes of Mt. Gari, and the forest is
              home to endangered species including the{" "}
              <strong>goral (natural monument), black woodpecker, and otter</strong>.
              About <strong>70% of residents</strong> depend on pine nut
              production for their livelihoods.
            </p>
            <p>
              In 2019, <strong>Korea Hydro & Nuclear Power (KHNP)</strong>{" "}
              selected the area for a{" "}
              <strong>600MW pumped-storage hydroelectric power plant</strong>{" "}
              (2 × 300MW) after Hongcheon County applied to host the
              project. The total cost is{" "}
              <strong>1.59 trillion KRW (~$1.1 billion USD)</strong>, covering{" "}
              <strong>153 hectares</strong> of project area. Construction is
              contracted to the <strong>Daewoo E&C consortium</strong>{" "}
              (Daewoo E&C, DL E&C, Hyosung) at 615.5 billion KRW. An
              estimated <strong>~110,000 pine nut trees</strong> are slated
              for felling, and <strong>51 households</strong> face submersion
              and relocation.
            </p>
            <p>
              The villagers voted <strong>unanimously to oppose</strong> the
              project. Since then, they have held{" "}
              <strong>over 680 weekly protests</strong> in front of the county
              office, traveled to Seoul to petition the National Assembly and
              government ministries, and built alliances with{" "}
              <strong>over 140 organizations</strong> nationwide.
            </p>
            <p>
              <strong>7 residents (ages 60–80)</strong> have been
              criminally charged with refusal to vacate after a standoff at
              Hongcheon County Hall in July 2024. Despite the personal cost,
              they have not backed down. Their fight is conducted entirely
              through <strong>lawful, democratic means</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── By the Numbers ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center">
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { number: "7+", label: "Years of resistance" },
              { number: "680+", label: "Weekly protests held" },
              { number: "140+", label: "Organizations in solidarity" },
              { number: "110K+", label: "Pine nut trees at risk" },
            ].map((stat, i) => (
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
        </div>
      </section>

      {/* ── What's at Stake ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center">
            What's at Stake
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-forest)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                Ecological Destruction
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-[15px]">
                ~110,000 pine nut trees slated for felling across 153 hectares.
                A 1,800-hectare "Top 100 Forest" — home to
                the goral (natural monument), black woodpecker, and otter
                — faces permanent destruction.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-earth)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                Livelihood Loss
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-[15px]">
                70% of residents depend on pine nut production. Felling has
                already begun — 2,256 trees were cut in October 2024
                for access road construction. Destroying the forest means
                destroying their only means of survival.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-sky)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                Community Dissolution
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-[15px]">
                51 households face submersion and forced relocation. 7
                residents (ages 60–80) have been criminally charged.
                Decades-old bonds are being torn apart. Once scattered, this
                community cannot be rebuilt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How You Can Help ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            How You Can Help
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
            International attention can make a difference. Here is how you can
            support the residents of Pungcheon-ri.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left mb-12">
            <div className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15">
              <h3 className="text-lg font-bold mb-3">Sign the Petition</h3>
              <p className="text-white/70 text-[15px] leading-relaxed mb-5">
                Add your name to the growing list of people demanding the
                cancellation of this project.
              </p>
              <Link
                href="/petition"
                className="inline-flex items-center text-sm font-bold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
              >
                Go to petition →
              </Link>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15">
              <h3 className="text-lg font-bold mb-3">Share This Story</h3>
              <p className="text-white/70 text-[15px] leading-relaxed mb-5">
                Spread the word on social media. The more people know about
                Pungcheon-ri, the harder it is to ignore.
              </p>
              <p className="text-sm font-medium text-white/50">
                Share the link to this page
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15">
              <h3 className="text-lg font-bold mb-3">Media Inquiries</h3>
              <p className="text-white/70 text-[15px] leading-relaxed mb-5">
                Are you a journalist or researcher? We welcome international
                media coverage of this story.
              </p>
              <a
                href="https://campaigns.do/campaigns/1328"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
              >
                Contact via campaign page
              </a>
            </div>
          </div>

          <Link
            href="/petition"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
          >
            Sign the Petition
          </Link>
        </div>
      </section>
    </article>
  );
}
