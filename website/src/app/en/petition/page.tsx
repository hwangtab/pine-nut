import SubHero from "@/components/SubHero";
import { EditableLink, EditableRichText, EditableText } from "@/components/editable";
import ShareButtons from "@/components/ShareButtons";

const STATEMENT_PARAGRAPHS = [
  `The pine forest of Pungcheon-ri has stood here since 1937. In 2017, Korea's forest authority named it one of the country's ten finest forests, and it still ranks among the nation's 100 finest forests today. This village produces 62 percent of Korea's domestic pine nuts. Its forest and valley are home to residents who have lived here for generations — and to species the state has pledged by law to protect: the Korean goral and the otter, both Class Ⅰ endangered species and natural monuments, and the yellow-throated marten, a Class Ⅱ endangered species.`,
  `A 600-megawatt pumped-storage hydroelectric plant is now planned for this site. If it proceeds, 111,999 trees will be cut down; 2,256 have already fallen for a relocation road. 51 households will be flooded out or forced to leave. Residents of Pungcheon-ri have been fighting to protect this forest and village for eight years — most of them elderly people who have lived here their whole lives.`,
  `Pumped-storage hydro is not a way of generating electricity — it is a way of storing it. Electricity is used to pump water uphill, then released downhill later to generate power again. The U.S. Energy Information Administration (EIA) and the National Renewable Energy Laboratory (NREL) put its round-trip efficiency at roughly 80 percent: about a fifth of the electricity put in is lost in the process of storing and retrieving it.`,
  `We do not deny that Korea needs energy storage. What we ask for is transparency: is this project truly necessary, what are its real storage gains and losses, how much public money is at stake, and on what legal grounds was it approved? We ask that a way be found to meet the country's storage needs without destroying the forest and valley of Pungcheon-ri. We are not asking for compensation. We are asking that Pungcheon-ri's forest, valley, and the lives within it be left as they are.`,
].join("\n\n");

export default function EnglishPetitionPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <SubHero
        imageUrl="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535383_std.jpg"
        imageContentKey="en.petition.hero.image"
        imagePage="en/petition"
        imageSection="hero"
        title={<EditableText contentKey="en.petition.hero.title" defaultValue="We Are the Trees" as="span" page="en/petition" section="hero" />}
        subtitle={<EditableText contentKey="en.petition.hero.subtitle" defaultValue="A national solidarity petition to stop the Pungcheon-ri pumped-storage project and protect its forest and valley" as="span" page="en/petition" section="hero" />}
        eyebrow={<EditableText contentKey="en.petition.hero.eyebrow" defaultValue="National Solidarity Petition" as="span" page="en/petition" section="hero" />}
        variant="emphasis"
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-10">
        <EditableRichText
          contentKey="en.petition.statement.summary"
          defaultValue={STATEMENT_PARAGRAPHS}
          page="en/petition"
          section="statement"
          className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
        />

        <div className="flex flex-col items-center gap-4 py-4">
          <EditableLink
            contentKey="en.petition.cta.signHref"
            defaultHref="/petition"
            page="en/petition"
            section="cta"
            className="letter-btn letter-btn--primary min-h-[48px] px-8"
          >
            <EditableText
              contentKey="en.petition.cta.signLabel"
              defaultValue="Sign the petition (Korean)"
              as="span"
              page="en/petition"
              section="cta"
            />
          </EditableLink>
          <EditableText
            contentKey="en.petition.cta.note"
            defaultValue="The petition form is in Korean. Your name, region, and message are welcome in any language."
            as="p"
            page="en/petition"
            section="cta"
            className="text-sm text-[var(--color-text-muted)] text-center max-w-md"
          />
        </div>

        <ShareButtons
          title="We Are the Trees — Save Pungcheon-ri"
          page="en/petition"
          section="share"
          contentPrefix="en.petition.share"
          locale="en"
        />
      </div>
    </div>
  );
}
