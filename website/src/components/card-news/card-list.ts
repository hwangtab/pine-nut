import {
  Card1,
  Card2,
  Card3,
  Card4,
  Card5,
  type CardNewsCardComponent,
} from "@/components/card-news/CardNewsCards";
import {
  CARD_NEWS_TEXT,
  type CardNewsLocale,
} from "@/components/card-news/card-news-content";

export interface CardNewsItem {
  id: number;
  title: string;
  Component: CardNewsCardComponent;
}

export function buildCardList(locale: CardNewsLocale): CardNewsItem[] {
  return [
    { id: 1, title: CARD_NEWS_TEXT[locale].cardTitles[0], Component: Card1 },
    { id: 2, title: CARD_NEWS_TEXT[locale].cardTitles[1], Component: Card2 },
    { id: 3, title: CARD_NEWS_TEXT[locale].cardTitles[2], Component: Card3 },
    { id: 4, title: CARD_NEWS_TEXT[locale].cardTitles[3], Component: Card4 },
    { id: 5, title: CARD_NEWS_TEXT[locale].cardTitles[4], Component: Card5 },
  ];
}
