import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7년의 기록 — 풍천리를 지켜주세요",
  description:
    "2019년부터 현재까지, 풍천리 주민들의 양수발전소 건설 반대 투쟁 타임라인. 680회 이상의 집회 기록.",
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
