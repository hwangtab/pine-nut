import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { localeAlternates } from "@/lib/seo-alternates";

// 홈은 루트 layout이 곧 자기 레이아웃이라 별도 layout에 metadata를 둘 수 없다.
// 루트 layout에 alternates를 두면 모든 하위 페이지가 canonical=홈을 상속하므로,
// 화면 로직은 HomeClient로 분리하고 이 서버 컴포넌트가 홈의 메타데이터만 담당한다.
export const metadata: Metadata = {
  alternates: localeAlternates("/", "/en"),
};

export default function HomePage() {
  return <HomeClient />;
}
