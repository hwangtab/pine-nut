"use client";

import { EditableValue } from "@/components/editable";
import {
  CARD_NEWS_TEXT,
  getSharePage,
  getSharePrefix,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";

export default function CardNewsEditControls({
  locale,
}: {
  locale: CardNewsLocale;
}) {
  const page = getSharePage(locale);
  const prefix = getSharePrefix(locale);

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-2 sm:right-4 left-2 sm:left-auto z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur max-w-sm sm:max-w-none">
      <EditableValue
        contentKey={`${prefix}.cards.shareTitle`}
        defaultValue={CARD_NEWS_TEXT[locale].shareTitle}
        page={page}
        section="cards"
        buttonLabel={locale === "ko" ? "공유 제목" : "Share title"}
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey={`${prefix}.cards.copySuccess`}
        defaultValue={CARD_NEWS_TEXT[locale].copySuccess}
        page={page}
        section="cards"
        buttonLabel={locale === "ko" ? "복사 성공" : "Copy success"}
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey={`${prefix}.cards.copyFailure`}
        defaultValue={CARD_NEWS_TEXT[locale].copyFailure}
        page={page}
        section="cards"
        buttonLabel={locale === "ko" ? "복사 실패" : "Copy failure"}
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey={`${prefix}.cards.downloadFailure`}
        defaultValue={CARD_NEWS_TEXT[locale].downloadFailure}
        page={page}
        section="cards"
        multiline
        buttonLabel={locale === "ko" ? "다운로드 오류" : "Download error"}
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
    </div>
  );
}
