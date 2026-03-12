import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableText } from "@/components/editable";

export default function EnglishNotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UtilityHeader
        title={<EditableText contentKey="en.notfound.header.title" defaultValue="Page not found" as="span" page="en" section="not-found" />}
        subtitle={<EditableText contentKey="en.notfound.header.subtitle" defaultValue="The page you requested does not exist or may have moved." as="span" page="en" section="not-found" />}
        eyebrow={<EditableText contentKey="en.notfound.header.eyebrow" defaultValue="Error" as="span" page="en" section="not-found" />}
        tone="forest"
      />

      <section className="max-w-2xl mx-auto px-6 py-14 md:py-16 text-center">
        <EditableLink contentKey="en.notfound.primary.href" defaultHref="/en" page="en" section="not-found" className="inline-block bg-[var(--color-warm)] text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
          <EditableText contentKey="en.notfound.primary.label" defaultValue="Back to English home" as="span" page="en" section="not-found" />
        </EditableLink>
      </section>
    </div>
  );
}
