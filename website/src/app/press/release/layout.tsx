import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localeAlternates } from "@/lib/seo-alternates";

// page.tsx가 "use client"라 metadata를 export할 수 없어 레이아웃에서 선언한다.
export const metadata: Metadata = {
  title: "보도자료 — 풍천리를 지켜주세요",
  description:
    "풍천리 양수발전소 건설 반대 보도자료. 사업 개요, 피해 내용, 주민 요구를 언론 보도용으로 정리했습니다.",
  alternates: localeAlternates("/press/release", "/en/press/release"),
};

export default function PressReleaseLayout({ children }: { children: ReactNode }) {
  return children;
}
