export interface ShareButtonsProps {
  title: string;
  url?: string;
  page?: string;
  section?: string;
  contentPrefix?: string;
}

export interface ShareEditableContext {
  page: string;
  section: string;
  contentPrefix: string;
}

export type ShareLabelKey = "label" | "kakao" | "twitter" | "facebook" | "copy" | "copied";
