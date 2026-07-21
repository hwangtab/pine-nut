export type CardNewsLocale = "ko" | "en";

export const CARD_NEWS_TEXT = {
  ko: {
    brand: "풍천리를 지켜주세요",
    shareTitle: "풍천리를 지켜주세요",
    sharePath: "/share",
    downloadPrefix: "풍천리-카드",
    download: "다운로드",
    copyLink: "링크 복사",
    share: "공유",
    copySuccess: "링크가 복사되었습니다!",
    copyFailure: "링크 복사에 실패했습니다.",
    downloadFailure: "이미지 다운로드에 실패했습니다. 카드를 길게 눌러 저장해주세요.",
    card1Eyebrow: "강원도 홍천 풍천리",
    card1Title: "705번의 외침",
    card1Stats: [
      { num: "705+", label: "집회 횟수" },
      { num: "140+", label: "연대 단체" },
      { num: "11만", label: "잣나무" },
    ],
    card1Body: "양수발전소 건설에 맞서 마을과 자연을 지키기 위한 주민들의 기록",
    card2Title1: "11만 그루 잣나무가",
    card2Title2: "사라집니다",
    card2Bullets: [
      { icon: "🌲", text: "산림청 지정 100대 명품숲 파괴" },
      { icon: "📐", text: "1,800ha 국내 최대 잣나무 숲" },
      { icon: "🦌", text: "산양·까막딱따구리·수달 서식지 위협" },
      { icon: "⛏️", text: "153ha 산림 영구 훼손 예정" },
    ],
    card3Title: "70대 어르신들이\n전과자가 되었습니다",
    card3Body:
      "2024년 7월, 홍천군청에서 경찰과 대치.\n60~80대 주민 7명이 퇴거불응 혐의로 기소.",
    card3FineLabel: "벌금 구형 총액",
    card3Quote:
      "칠십 평생 남에게 해를 끼친 적 없는 사람이,\n내 땅을 지키겠다는 이유로.",
    card4Title1: "당신도",
    card4Title2: "함께해주세요",
    card4Body: "풍천리 주민들의 싸움은\n우리 모두의 싸움입니다.",
    card4Actions: [
      { num: "1", label: "서명", desc: "캠페인에 서명해주세요" },
      { num: "2", label: "후원", desc: "작은 금액도 큰 힘이 됩니다" },
      { num: "3", label: "공유", desc: "SNS에 알려주세요" },
    ],
    card4SiteLabel: "캠페인 사이트",
    card5Title: "풍천리 타임라인",
    card5Body:
      "2019년부터 2026년까지, 밀어붙인 개발과 멈추지 않은 저항",
    card5Timeline: [
      { date: "2019.03", event: "군수, 주민 반대 시 중단 약속" },
      { date: "2019.04", event: "주민설명회 강행, 철야 농성" },
      { date: "2019", event: "반대대책위 결성, 정기 집회 시작" },
      { date: "2021.05", event: "우선사업자 선정" },
      { date: "2022.02", event: "공공 예비타당성조사 통과" },
      { date: "2023.05", event: "사업예정구역 지정·고시" },
      { date: "2024.07", event: "홍천군청 경찰 대치" },
      { date: "2024.10", event: "잣나무 2,256그루 벌채 시작" },
      { date: "2025.08", event: "실시계획인가 고시" },
      { date: "2025.11", event: "주민 7명 기소" },
      { date: "2026.01", event: "본공사 착공 예정" },
    ],
    cardTitles: [
      "7년, 705번의 외침",
      "11만 그루 잣나무가 사라집니다",
      "70대 어르신이 전과자가 되었습니다",
      "당신도 함께해주세요",
      "풍천리 타임라인",
    ],
  },
  en: {
    brand: "Save Pungcheon-ri",
    shareTitle: "Save Pungcheon-ri",
    sharePath: "/en/share",
    downloadPrefix: "save-pungcheonri-card-",
    download: "Download",
    copyLink: "Copy Link",
    share: "Share",
    copySuccess: "Link copied.",
    copyFailure: "Failed to copy the link.",
    downloadFailure:
      "Download failed. Please long-press the card image to save it.",
    card1Eyebrow: "Pungcheon-ri, Hongcheon, South Korea",
    card1Title: "705 Cries of Resistance",
    card1Stats: [
      { num: "705+", label: "Weekly protests" },
      { num: "140+", label: "Allied groups" },
      { num: "110K", label: "Pine trees" },
    ],
    card1Body:
      "Residents have spent more than seven years defending their village and pine forest from a pumped-storage power plant.",
    card2Title1: "110,000 Pine Trees",
    card2Title2: "Could Be Lost",
    card2Bullets: [
      { icon: "🌲", text: "A Korea Forest Service Top 100 Forest at risk" },
      { icon: "📐", text: "1,800 hectares of pine nut forest" },
      { icon: "🦌", text: "Habitat for goral, black woodpecker, and otter" },
      { icon: "⛏️", text: "About 153 hectares threatened by permanent damage" },
    ],
    card3Title: "Elderly Residents\nNow Face Criminal Charges",
    card3Body:
      "In July 2024, residents confronted police at Hongcheon County Hall.\nSeven villagers aged 60 to 80 were indicted.",
    card3FineLabel: "Total fines sought",
    card3Quote:
      "People who never harmed anyone in their lives\nare being punished for trying to defend their land.",
    card4Title1: "Stand",
    card4Title2: "With Them",
    card4Body:
      "The struggle in Pungcheon-ri belongs\nto everyone who cares about forests and communities.",
    card4Actions: [
      { num: "1", label: "Sign", desc: "Add your name to the petition" },
      { num: "2", label: "Donate", desc: "Help cover transport and legal costs" },
      { num: "3", label: "Share", desc: "Spread the story online" },
    ],
    card4SiteLabel: "Campaign site",
    card5Title: "Pungcheon-ri Timeline",
    card5Body:
      "From 2019 to 2026: development was pushed ahead, and resistance never stopped.",
    card5Timeline: [
      { date: "2019.03", event: "Governor promises to stop if residents oppose" },
      { date: "2019.04", event: "Public briefing forced through; overnight sit-in begins" },
      { date: "2019", event: "Opposition committee formed; weekly protests begin" },
      { date: "2021.05", event: "Preferred developer selected" },
      { date: "2022.02", event: "Public feasibility review passes" },
      { date: "2023.05", event: "Project zone officially designated" },
      { date: "2024.07", event: "Police confrontation at county hall" },
      { date: "2024.10", event: "2,256 pine trees cut for relocation road" },
      { date: "2025.08", event: "Implementation approval notice issued" },
      { date: "2025.11", event: "Seven residents indicted" },
      { date: "2026.01", event: "Main construction scheduled" },
    ],
    cardTitles: [
      "705 cries of resistance",
      "110,000 pine trees at risk",
      "Elderly residents face charges",
      "Stand with Pungcheon-ri",
      "Pungcheon-ri timeline",
    ],
  },
} as const;

export function getSharePage(locale: CardNewsLocale) {
  return locale === "ko" ? "share" : "en/share";
}

export function getSharePrefix(locale: CardNewsLocale) {
  return locale === "ko" ? "share" : "en.share";
}
