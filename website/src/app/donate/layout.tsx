import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "후원하기 — 풍천리를 지켜주세요",
  description:
    "풍천리 주민들의 법률 비용과 투쟁 활동을 후원해주세요. 후원금 사용 내역은 정리 후 이 페이지에 투명하게 공개됩니다.",
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
