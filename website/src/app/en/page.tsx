import type { Metadata } from "next";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableText, EditableRichText } from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import { SITE_URL } from "@/lib/site-config";
import {
  EnglishHelpCards,
  EnglishNumbersSection,
  EnglishStakeSection,
} from "./EnglishSectionsClient";

export const metadata: Metadata = {
  title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
  description:
    "Elderly villagers in Pungcheon-ri, South Korea, are fighting to protect their pine nut forests and community from a destructive pumped-storage power plant.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      ko: "/",
    },
  },
  openGraph: {
    title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
    description:
      "A 7-year fight to protect a village, a forest, and a way of life. Learn how you can help.",
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/en`,
  },
};

const EN_SECTION_ORDER = ["story", "numbers", "stake", "help"] as const;

export default function EnglishPage() {
  return (
    <article>
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        title={<EditableText contentKey="en.hero.title" defaultValue="Save Pungcheon-ri" as="span" page="en" section="hero" />}
        subtitle={<EditableText contentKey="en.hero.subtitle" defaultValue="A 7-Year Fight to Protect a Village, a Forest, and a Way of Life" as="span" page="en" section="hero" />}
        eyebrow="English Summary"
      />

      <OrderedSectionGroup page="en" defaultOrder={[...EN_SECTION_ORDER]}>
      <ManagedSection
        page="en"
        sectionId="story"
        visibilityContentKey="en.story.visibility"
        section="story"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]"
      >
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
              renderMode="paragraphs"
              className="space-y-6 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            />
          </div>
      </ManagedSection>

      <ManagedSection
        page="en"
        sectionId="numbers"
        visibilityContentKey="en.numbers.visibility"
        section="numbers"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]"
      >
          <div className="max-w-4xl mx-auto">
            <EditableText
              contentKey="en.numbers.title"
              defaultValue="By the Numbers"
              as="h2"
              page="en"
              section="numbers"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
            />
            <EnglishNumbersSection />
          </div>
      </ManagedSection>

      <ManagedSection
        page="en"
        sectionId="stake"
        visibilityContentKey="en.stake.visibility"
        section="stake"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]"
      >
          <div className="max-w-4xl mx-auto">
            <EditableText
              contentKey="en.stake.title"
              defaultValue="What's at Stake"
              as="h2"
              page="en"
              section="stake"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
            />
            <EnglishStakeSection />
          </div>
      </ManagedSection>

      <ManagedSection
        page="en"
        sectionId="help"
        visibilityContentKey="en.help.visibility"
        section="help"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white"
      >
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
            <EnglishHelpCards />
            <EditableLink
              contentKey="en.cta.href"
              defaultHref="/petition"
              page="en"
              section="help"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
            >
              <EditableText contentKey="en.cta.button" defaultValue="Sign the Petition" as="span" page="en" section="help" />
            </EditableLink>
          </div>
      </ManagedSection>
      </OrderedSectionGroup>
    </article>
  );
}
