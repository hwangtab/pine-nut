import type { Metadata } from "next";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
import {
  EnglishStoryBattleSection,
  EnglishStoryDemandsSection,
  EnglishStoryReasonsSection,
  EnglishStoryTransportSection,
} from "./EnglishStorySectionsClient";

export const metadata: Metadata = {
  title: "The Story — Save Pungcheon-ri",
  description:
    "A detailed English overview of Pungcheon-ri, the pumped-storage project, and why residents have fought it for more than seven years.",
  alternates: {
    canonical: "/en/story",
    languages: {
      en: "/en/story",
      ko: "/story",
    },
  },
};

export default function EnglishStoryPage() {
  return (
    <article>
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        imageContentKey="en.storyPage.hero.image"
        imagePage="en/story"
        imageSection="hero"
        title={<EditableText contentKey="en.storyPage.hero.title" defaultValue="The Story of Pungcheon-ri" as="span" page="en/story" section="hero" />}
        subtitle={<EditableText contentKey="en.storyPage.hero.subtitle" defaultValue="Seven years of resistance to protect a pine forest, a mountain village, and a way of life" as="span" page="en/story" section="hero" />}
        eyebrow={<EditableText contentKey="en.storyPage.hero.eyebrow" defaultValue="Village Voices" as="span" page="en/story" section="hero" />}
      />

      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <EditableText
            contentKey="en.storyPage.village.heading"
            defaultValue="What kind of place is Pungcheon-ri?"
            as="h2"
            page="en/story"
            section="village"
            className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
          />
          <EditableRichText
            contentKey="en.storyPage.village.body"
            defaultValue={`Pungcheon-ri is a small mountain village in Hwacheon-myeon, Hongcheon County, Gangwon Province. It sits within a 1,800-hectare pine nut forest recognized by the Korea Forest Service as one of the country's Top 100 Forests, with century-old Korean pine trees spread across the slopes of Mt. Gari.

About 70% of residents rely on pine nut harvesting for their livelihoods. The forest is not simply scenery. It is the economic and cultural foundation of the village.

The area is also habitat for endangered wildlife including the goral, black woodpecker, and otter. For generations, people and nature have lived closely together here.`}
            page="en/story"
            section="village"
            renderMode="paragraphs"
            className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
          />
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-3xl mx-auto">
          <EditableText
            contentKey="en.storyPage.plant.heading"
            defaultValue="What is the pumped-storage plant?"
            as="h2"
            page="en/story"
            section="plant"
            className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
          />
          <EditableRichText
            contentKey="en.storyPage.plant.body"
            defaultValue={`The project is a 600MW pumped-storage hydroelectric plant proposed by Korea Hydro & Nuclear Power (KHNP), consisting of two 300MW units. It would build upper and lower reservoirs, pump water uphill when electricity demand is low, and release it to generate electricity when demand rises.

The total project cost is about 1.5863 trillion KRW, covering roughly 153 hectares. Construction has been assigned to the Daewoo E&C consortium.

Hongcheon County applied to host the plant in 2019, after which KHNP selected Pungcheon-ri as a candidate site. If built as planned, 51 households would face submersion and relocation, while large areas of pine forest would be uprooted and mountain streams would be transformed.`}
            page="en/story"
            section="plant"
            renderMode="paragraphs"
            className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
          />
        </div>
      </section>

      <EnglishStoryReasonsSection />
      <EnglishStoryBattleSection />
      <EnglishStoryDemandsSection />

      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <EditableText
            contentKey="en.storyPage.video.heading"
            defaultValue="Watch the story"
            as="h2"
            page="en/story"
            section="video"
            className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10 text-center"
          />
          <EditableText
            contentKey="en.storyPage.video.description"
            defaultValue="Watch a short video introducing the residents' long struggle and the pine forest they are trying to protect."
            as="p"
            page="en/story"
            section="video"
            className="text-center text-[var(--color-text-muted)] mb-8 text-base md:text-lg"
          />
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border-2 border-[var(--color-forest)]/15">
            <iframe
              src="https://www.youtube.com/embed/MtmOKKpkGMk"
              title="Save Pungcheon-ri campaign video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-3xl mx-auto">
          <EditableText
            contentKey="en.storyPage.location.heading"
            defaultValue="Where is Pungcheon-ri?"
            as="h2"
            page="en/story"
            section="location"
            className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
          />
          <div className="rounded-2xl overflow-hidden border-2 border-[var(--color-forest)]/15 shadow-sm">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=127.93,37.78,128.04,37.85&layer=mapnik&marker=37.8167,127.9833"
              className="w-full h-[300px] md:h-[400px] lg:h-[450px] border-0"
              loading="lazy"
              title="Map of Pungcheon-ri"
            />
          </div>
          <EditableText
            contentKey="en.storyPage.location.description"
            defaultValue="Pungcheon-ri, Hwacheon-myeon, Hongcheon County, Gangwon Province — a mountain village on the slopes of Mt. Gari at 400 to 700 meters above sea level."
            as="p"
            page="en/story"
            section="location"
            className="mt-4 text-center text-sm md:text-base text-[var(--color-text-muted)]"
          />

          <EnglishStoryTransportSection />
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <EditableText
            contentKey="en.storyPage.cta.heading"
            defaultValue="Stand with Pungcheon-ri"
            as="h2"
            page="en/story"
            section="cta"
            className="text-3xl md:text-4xl font-black mb-6"
          />
          <EditableRichText
            contentKey="en.storyPage.cta.body"
            defaultValue={`This struggle belongs to all of us who care about forests, democracy, and rural communities.
Small actions from outside the village can still make a real difference.`}
            page="en/story"
            section="cta"
            renderMode="lines"
            className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <EditableLink
              contentKey="en.storyPage.cta.signButton.href"
              defaultHref="/en/petition"
              page="en/story"
              section="cta"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
            >
              <EditableText contentKey="en.storyPage.cta.signButton" defaultValue="Sign the petition" as="span" page="en/story" section="cta" />
            </EditableLink>
            <EditableLink
              contentKey="en.storyPage.cta.donateButton.href"
              defaultHref="/en/donate"
              page="en/story"
              section="cta"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/15 border-2 border-white/30 text-white font-bold text-lg hover:bg-white/25 transition-colors min-h-[52px]"
            >
              <EditableText contentKey="en.storyPage.cta.donateButton" defaultValue="Donate" as="span" page="en/story" section="cta" />
            </EditableLink>
          </div>
        </div>
      </section>
    </article>
  );
}
