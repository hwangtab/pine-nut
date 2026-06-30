"use client";

import { EditableLink, EditableRichText, EditableText } from "@/components/editable";

export default function FooterBrand() {
  return (
    <div>
      <EditableLink
        contentKey="footer.brand.href"
        defaultHref="/"
        page="footer"
        section="brand"
        className="mb-3 block text-xl font-bold"
      >
        <EditableText
          contentKey="footer.brand.name"
          defaultValue="풍천리를 지켜주세요"
          as="span"
          page="footer"
          section="brand"
        />
      </EditableLink>
      <EditableRichText
        contentKey="footer.brand.description"
        defaultValue="풍천리양수발전소건설반대위원회는 마을과 자연을 지키기 위해 양수발전소 건설에 반대하는 주민들의 모임입니다."
        page="footer"
        section="brand"
      >
        {(value) => (
          <p className="text-white/70 text-sm leading-relaxed">
            {value}
          </p>
        )}
      </EditableRichText>
    </div>
  );
}
