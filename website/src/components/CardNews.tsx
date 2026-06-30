"use client";

import CardNewsEditControls from "@/components/card-news/CardNewsEditControls";
import { CardWithActions } from "@/components/card-news/CardWithActions";
import { buildCardList } from "@/components/card-news/card-list";
import type { CardNewsLocale } from "@/components/card-news/card-news-content";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

export default function CardNews({
  locale = "ko",
}: {
  locale?: CardNewsLocale;
}) {
  const { isEditMode } = useAdminEdit();
  const cardList = buildCardList(locale);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {cardList.map((card) => (
            <CardWithActions key={card.id} card={card} locale={locale} />
          ))}
        </div>
      </div>
      {isEditMode && <CardNewsEditControls locale={locale} />}
    </section>
  );
}
