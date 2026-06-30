import { EditableText } from "@/components/editable";

export function HomeInlineSignatureSuccess() {
  return (
    <div className="text-center py-6">
      <EditableText
        contentKey="home.cta.inlineSuccess"
        defaultValue="감사합니다! 서명이 완료되었습니다 🎉"
        as="p"
        page="home"
        section="cta"
        className="text-xl font-bold text-[var(--color-forest)]"
      />
    </div>
  );
}
