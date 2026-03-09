import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서명하기 — 풍천리를 지켜주세요",
  description:
    "양수발전소 건설 반대 서명에 참여해주세요. 당신의 이름 하나가 풍천리 주민들에게 큰 힘이 됩니다.",
};

export default function PetitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
