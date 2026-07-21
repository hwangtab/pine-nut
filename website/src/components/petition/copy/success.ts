import type { PetitionSuccessCopy } from "./types";

export const koreanPetitionSuccessCopy: PetitionSuccessCopy = {
  page: "petition",
  countLocale: "ko-KR",
  titlePrefix: { contentKey: "petition.success.titlePrefix", defaultValue: "감사합니다," },
  titleSuffix: { contentKey: "petition.success.titleSuffix", defaultValue: "님!" },
  countSuffix: {
    contentKey: "petition.success.countSuffix",
    defaultValue: "번째로 함께해주셨습니다.",
  },
  sharePrompt: {
    contentKey: "petition.success.sharePrompt",
    defaultValue: "더 많은 사람에게 알려주세요",
  },
  primaryShare: {
    contentKey: "petition.success.shareKakao",
    defaultValue: "카카오톡 공유",
  },
  primaryShareClassName:
    "min-h-[48px] px-6 py-3 rounded-full bg-[#FEE500] text-[#191919] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90",
  twitterShare: {
    contentKey: "petition.success.shareTwitter",
    defaultValue: "트위터 공유",
  },
  copyLabel: { contentKey: "petition.success.copy", defaultValue: "URL 복사" },
  copiedLabel: { contentKey: "petition.success.copied", defaultValue: "복사됨!" },
  resetLabel: {
    contentKey: "petition.success.reset",
    defaultValue: "다른 사람도 서명하기",
  },
};

export const englishPetitionSuccessCopy: PetitionSuccessCopy = {
  page: "en/petition",
  countLocale: "en-US",
  titlePrefix: { contentKey: "en.petition.success.titlePrefix", defaultValue: "Thank you," },
  titleSuffix: { contentKey: "en.petition.success.titleSuffix", defaultValue: "." },
  countPrefix: {
    contentKey: "en.petition.success.countPrefix",
    defaultValue: "You are signer number",
  },
  countSuffix: { contentKey: "en.petition.success.countSuffix", defaultValue: "." },
  primaryShare: { contentKey: "en.petition.success.share", defaultValue: "Share" },
  primaryShareClassName:
    "min-h-[48px] px-6 py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90",
  twitterShare: { contentKey: "en.petition.success.shareX", defaultValue: "Share on X" },
  copyLabel: { contentKey: "en.petition.success.copy", defaultValue: "Copy URL" },
  copiedLabel: { contentKey: "en.petition.success.copied", defaultValue: "Copied" },
};
