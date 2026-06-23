export interface GalleryPhoto {
  id: number;
  title: string;
  url: string;
  credit: string;
  description: string;
}

export interface EditableGalleryPhoto {
  [key: string]: string;
  id: string;
  title: string;
  url: string;
  credit: string;
  description: string;
}

export const GALLERY_SECTION_ORDER = [
  "beauty",
  "struggle",
  "solidarity",
  "cta",
] as const;

export const defaultBeautyPhotos = [
  {
    id: "1",
    title: "드론으로 본 풍천리 전경",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg",
    credit: "오마이뉴스",
    description: "가리산 자락에 자리한 풍천리 마을의 항공 촬영 사진",
  },
  {
    id: "2",
    title: "100년 잣나무숲",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg",
    credit: "오마이뉴스",
    description: "전국 최고 품질의 잣을 생산하는 풍천리 잣나무숲",
  },
  {
    id: "3",
    title: "하부댐 건설 예정 지역",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535386_STD.jpg",
    credit: "오마이뉴스",
    description: "양수발전소 하부댐으로 수몰될 위기의 풍천리 계곡",
  },
];

export const defaultStrugglePhotos = [
  {
    id: "4",
    title: "주민들의 거리 집회 (2019)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116512855285_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2019년 양수발전소 건설 반대를 외치는 풍천리 주민들",
  },
  {
    id: "5",
    title: "시내 거리 행진 (2019)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116584845825_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2019년 양수발전소 건립 철회를 요구하는 시내 집회",
  },
  {
    id: "6",
    title: "홍천군청 경찰 대치 (2024)",
    url: "https://img1.newsis.com/2024/07/22/NISI20240722_0001608612_web.jpg",
    credit: "뉴시스",
    description: "2024년 7월 홍천군청에서 경찰과 대치하는 주민들",
  },
  {
    id: "7",
    title: "농성장 철거 (2020)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116580311974_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2020년 홍천군청 인근 농성장이 철거되는 모습",
  },
  {
    id: "8",
    title: "가리산 훼손 현장",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535385_STD.jpg",
    credit: "오마이뉴스",
    description: "이설도로 공사로 훼손되고 있는 56번 도로 부근 가리산",
  },
  {
    id: "9",
    title: "드론 촬영 댐 계획 부지",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116565874407_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description:
      "드론으로 촬영한 댐 건설 계획 부지. 이설도로 공사로 벌목된 산이 보인다",
  },
  {
    id: "10",
    title: "마을 반대 플래카드",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535384_STD.jpg",
    credit: "오마이뉴스",
    description:
      "'댐 2개 양수발전소가 관광자원? 아무도 믿지 않을 거짓말!' 풍천리 마을 플래카드",
  },
];

export const defaultSolidarityPhotos = [
  {
    id: "11",
    title: "대통령실 앞 기자회견 (2025.6)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535381_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 6월 10일 대통령실 앞에서 열린 양수발전소 건설반대 기자회견",
  },
  {
    id: "12",
    title: "국정기획위 기자회견 (2025.8)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535382_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 8월 1일 국정기획위원회 앞 기자회견장의 풍천리 주민들",
  },
  {
    id: "13",
    title: "강원생명평화기도회 (2025.8)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 8월 22일 강원생명평화기도회에 모인 연대 참가자들",
  },
  {
    id: "14",
    title: "시민공모전 대상 수상 (2025.10)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116494078758_l.JPG",
    credit: "프레시안 (손가영 기자)",
    description:
      "한국내셔널트러스트 '이곳만은 지키자' 시민공모전에서 대상을 수상한 주민들",
  },
  {
    id: "15",
    title: "672차 결의대회 (2025.10)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description:
      "672차 강원생명평화기도회 및 양수발전소·송전탑 백지화 결의대회",
  },
];

export const photoFields = [
  { key: "title" as const, label: "제목" },
  { key: "url" as const, label: "이미지 URL", type: "url" as const },
  { key: "credit" as const, label: "출처" },
  { key: "description" as const, label: "설명", type: "textarea" as const },
];

export function toGalleryPhoto(
  item: EditableGalleryPhoto,
  index: number,
): GalleryPhoto {
  return {
    id: item.id ? Number(item.id) : index + 1,
    title: item.title,
    url: item.url,
    credit: item.credit,
    description: item.description,
  };
}
