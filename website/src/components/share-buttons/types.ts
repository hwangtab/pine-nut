export type ShareLocale = "ko" | "en";

export interface ShareButtonsProps {
  title: string;
  url?: string;
  page?: string;
  section?: string;
  contentPrefix?: string;
  /** 버튼 문구·aria-label 언어. 영문 페이지에서 "en"을 넘긴다. */
  locale?: ShareLocale;
}

export interface ShareEditableContext {
  page: string;
  section: string;
  contentPrefix: string;
}

export type ShareLabelKey = "label" | "kakao" | "twitter" | "facebook" | "copy" | "copied";
