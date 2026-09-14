// 「베어지기 전에 풍천리」 공연(2026-08-01 청와대 앞) 정보·D-day 유틸

export const CONCERT_TITLE = "베어지기 전에 풍천리";
export const CONCERT_DATE_LABEL = "2026년 8월 1일(토)";
export const CONCERT_TIME_LABEL = "오후 1시 – 오후 8시";
export const CONCERT_PLACE = "청와대 앞";
export const CONCERT_PHONE = "010-8748-3044";
/** 공연 문의를 받는 사람. 번호와 이름은 항상 같이 표기한다. */
export const CONCERT_PHONE_NAME = "박성율 목사";

export const CONCERT_START = new Date("2026-08-01T13:00:00+09:00");
// 14팀(30분×14=7시간) + 마무리 10분 → 20:10 종료
export const CONCERT_END = new Date("2026-08-01T20:10:00+09:00");

export const CONCERT_LINEUP = [
  "강민정",
  "강상석",
  "경하와 세민과 멍구와 흑염소",
  "길가는밴드 장현호",
  "김민정(알마즈)",
  "남수",
  "물장구클럽",
  "삼각전파사",
  "아나자오(ANAZAO)",
  "이서영",
  "자이",
  "종이코트",
  "치핵",
  "하늘소년",
];

export interface ConcertSlot {
  start: string;
  end: string;
  name: string;
}

// 공연 순서: 팀당 30분씩 연속 배정. 마무리 발언·단체사진 10분은 페이지에서 별도 표기.
export const CONCERT_TIMETABLE: ConcertSlot[] = [
  { start: "13:00", end: "13:30", name: "물장구클럽" },
  { start: "13:30", end: "14:00", name: "강민정" },
  { start: "14:00", end: "14:30", name: "경하와 세민과 멍구와 흑염소" },
  { start: "14:30", end: "15:00", name: "길가는밴드 장현호" },
  { start: "15:00", end: "15:30", name: "아나자오(ANAZAO)" },
  { start: "15:30", end: "16:00", name: "강상석" },
  { start: "16:00", end: "16:30", name: "이서영" },
  { start: "16:30", end: "17:00", name: "김민정(알마즈)" },
  { start: "17:00", end: "17:30", name: "자이" },
  { start: "17:30", end: "18:00", name: "남수" },
  { start: "18:00", end: "18:30", name: "종이코트" },
  { start: "18:30", end: "19:00", name: "하늘소년" },
  { start: "19:00", end: "19:30", name: "삼각전파사" },
  { start: "19:30", end: "20:00", name: "치핵" },
];

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// KST 날짜 기준 남은 일수(양수: 공연 전, 0: 당일, 음수: 지남).
// 공연마다 날짜가 다르므로 기준 시각을 인자로 받는다 — 특정 공연에 묶어두면
// 다음 공연이 잡힐 때마다 상수를 갈아끼워야 하고, 갈아끼우는 걸 잊으면
// 홈 배너가 지난 공연을 계속 가리킨다.
export function dday(start: Date, now: Date = new Date()): number {
  const dayIndex = (t: number) => Math.floor((t + KST_OFFSET_MS) / DAY_MS);
  return dayIndex(start.getTime()) - dayIndex(now.getTime());
}

export function ddayLabel(start: Date, now: Date = new Date()): string {
  const d = dday(start, now);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-DAY";
  return "공연 종료";
}

// ── 「풍천리 잣나무 마을 잔치」(2026-09-05 풍천리 마을회관) ──────────────────
// 8·1 청와대 앞 공연이 '올라간' 자리였다면, 이번은 음악가들이 마을로
// '내려오는' 잔치다. 2025년 7월 같은 마을회관에서 열린 「잣나무골 여름잔치」의
// 두 번째 자리이기도 하다.

// 포스터 제목 그대로. 2025년 같은 마을회관에서 열린 「잣나무골 여름잔치」의
// 계보를 잇는 이름이다.
export const FEAST_TITLE = "풍천리 잣나무 마을 잔치";
export const FEAST_DATE_LABEL = "2026년 9월 5일(토)";
export const FEAST_TIME_LABEL = "오후 1시 시작";
export const FEAST_PLACE = "풍천리 마을회관";
export const FEAST_ADDRESS = "강원도 홍천군 화촌면 풍천리";
export const FEAST_START = new Date("2026-09-05T13:00:00+09:00");

/** 대책위 문의(이창후 총무) */
export const FEAST_PHONE_COMMITTEE = "010-8918-8933";
/** 공연 문의 — 「베어지기 전에 풍천리」와 같은 번호·같은 사람이다 */
export const FEAST_PHONE_STAGE = CONCERT_PHONE;
export const FEAST_PHONE_STAGE_NAME = CONCERT_PHONE_NAME;

export interface ConcertArtist {
  name: string;
  /** 한 줄 소개. 확인된 자료가 없으면 비운다 — 지어내지 않는다. */
  blurb?: string;
  /** blurb 의 출처 URL */
  source?: string;
  /**
   * 정사각 프로필 사진(/images/concert/artists/*.jpg).
   * 본인이 맞다고 확인된 사진만 넣는다 — 합동 사진에서 누가 누구인지 추측하거나
   * 동명이인일 수 있는 사진을 넣으면 엉뚱한 사람의 얼굴을 걸게 된다.
   * 없으면 목록에서 잣송이 자리표시가 대신 들어간다(현재는 9팀 모두 있다).
   */
  photo?: string;
  /** 사진 출처. 게시 허락을 확인할 때 근거가 된다. */
  photoCredit?: string;
}

// 무대 순서: 세트 15분 + 전환 5분이라 한 팀이 20분씩 차지한다. 「베어지기 전에」와
// 같은 ConcertSlot 을 쓴다. 여기 없는 순서(인사말·발언 따위)는 넣지 않는다 —
// 정해지지 않은 것을 표에 적으면 확정된 일정처럼 읽힌다. 잔치는 포스터대로 1시에
// 열지만 무대는 2시부터다. 앞뒤로 붙는 여는 한 시간과 단체사진은 페이지에서
// 별도 표기한다.
export const FEAST_TIMETABLE: ConcertSlot[] = [
  { start: "14:00", end: "14:15", name: "길가는밴드 장현호" },
  { start: "14:20", end: "14:35", name: "박지휘" },
  { start: "14:40", end: "14:55", name: "경하와 세민" },
  { start: "15:00", end: "15:15", name: "최양다음 NEXT" },
  { start: "15:20", end: "15:35", name: "자이" },
  { start: "15:40", end: "15:55", name: "김동산과 블루이웃" },
  { start: "16:00", end: "16:15", name: "마쓰모토 코타" },
  { start: "16:20", end: "16:35", name: "ZSTHYGER" },
  { start: "16:40", end: "16:55", name: "삼각전파사" },
];

// 포스터에 적힌 순서 그대로. 소개는 확인된 것만 적는다 — source 가 있으면 공개
// 웹자료, 없으면(마쓰모토 코타·박지휘) 주최 측에서 받은 소개글을 다듬은 것이다.
export const FEAST_LINEUP: ConcertArtist[] = [
  {
    name: "경하와 세민",
    photo: "/images/concert/artists/kyungha-semin.jpg",
    photoCredit: "벅스 아티스트 페이지",
    blurb:
      "재개발로 쫓겨나는 자리, 세상에게 죽임당한 이를 기리는 자리에서 노래해온 듀오.",
    source: "https://music.bugs.co.kr/artist/20067057",
  },
  {
    name: "김동산과 블루이웃",
    photo: "/images/concert/artists/kimdongsan.jpg",
    photoCredit: "강정피스앤뮤직캠프",
    blurb:
      "수원의 포크·블루스 음악가 김동산과 밴드 블루이웃. 해고 노동자와 쫓겨나는 상인들의 이야기를 노래해 ‘한국의 우디거스리’로 불립니다.",
    source: "https://peaceandmusic.net/album/musicians/3",
  },
  {
    name: "길가는밴드 장현호",
    photo: "/images/concert/artists/gilganun.jpg",
    photoCredit: "강정피스앤뮤직캠프",
    blurb:
      "싱어송라이터 장현호를 중심으로 2011년 결성된 거리 밴드. 세월호, 강정마을, KTX 해고 승무원 — 십수 년을 현장에서 불러왔습니다.",
    source: "https://peaceandmusic.net/camps/2026/musicians/15",
  },
  {
    name: "마쓰모토 코타",
    photo: "/images/concert/artists/matsumoto-kota.jpg",
    photoCredit: "주최 측 제공",
    blurb:
      "일본과 베를린을 오가며 이주와 여행을 거듭해온 음악가. 거친 결의 목소리에 일본어 노랫말을 얹고 기타·피아노·아카펠라를 오갑니다. 2000년대 초 오사카 언더그라운드에서 출발해 일본 열도 100여 곳과 파리·탈린·코펜하겐·방콕·서울을 거쳤고, 2012년부터 베를린에 자리를 잡았습니다.",
  },
  {
    name: "박지휘",
    photo: "/images/concert/artists/parkjihwi.jpg",
    photoCredit: "주최 측 제공",
    blurb:
      "프리포크 싱어송라이터. 일러스트레이터 2da(이다)의 그림에서 따온 ‘sickbaby’라는 이름으로도 불렀습니다. 로파이한 프리포크로 시작해, 근래에는 엘리엇 스미스의 새드코어에 기운 곡을 씁니다.",
  },
  {
    name: "삼각전파사",
    photo: "/images/concert/artists/samgak.jpg",
    photoCredit: "강정피스앤뮤직캠프",
    blurb:
      "전자음악가이자 SF 작가 장호진의 솔로 프로젝트. 예측 불가능한 사운드와 비선형적 작곡으로 한국 사회의 구조적 모순을 담습니다. 2025년 정규 1집 「디스토피아 2025」.",
    source: "https://peaceandmusic.net/camps/2026/musicians/34",
  },
  {
    name: "자이",
    photo: "/images/concert/artists/jai.jpg",
    photoCredit: "강정피스앤뮤직캠프",
    blurb:
      "인디 1세대 밴드 헤디마마의 보컬·베이스를 거쳐, 지금은 낮은 중저음과 정직한 선율의 네오소울 포크를 씁니다.",
    source: "https://peaceandmusic.net/camps/2026/musicians/11",
  },
  {
    name: "최양다음 NEXT",
    photo: "/images/concert/artists/next.jpg",
    photoCredit: "주최 측 제공",
    // 이름의 유래와 공연 이력은 본인이 링크트리에 공개해둔 이력서에서 왔다.
    // https://docs.google.com/document/d/16nwDjfv7_O2XZzg2Kr7af01oF1Vlb8YdASaFEUCoDGQ
    // 이력서에는 윤석열 퇴진 집회·팔레스타인 연대 집회 공연도 적혀 있으나, 이 페이지가
    // 소개할 것은 이 사람이 어떤 자리에서 노래해왔느냐이지 정당 사안이 아니라서
    // 대표적인 자리 셋만 적었다. 빼야 할 이유가 있으면 이 줄과 함께 지우면 된다.
    blurb:
      "독학으로 음악을 익힌 싱어송라이터. 아버지 성 ‘최’와 어머니 성 ‘양’에 ‘다음’을 붙인 이름으로, 호주제에 맞선다는 뜻을 담아 지었습니다. 그 이름을 여러 나라 말로 씁니다 — 다음, NEXT, 次, Nächste, 翌. 세월호 10주기 추모, 수요시위, 5·18 기념식 같은 자리에서 노래해왔습니다.",
    source: "https://www.instagram.com/nextisnexttoyou/",
  },
  {
    name: "ZSTHYGER",
    photo: "/images/concert/artists/zsthyger.jpg",
    photoCredit: "경기아트콜렉티브",
    blurb:
      "전자음악·메탈·클래식을 아우르는 연주자이자 프로듀서. ‘악기와 악사의 가치를 증명하는 방법은 연주뿐’이라는 태도로 작업합니다.",
    source: "https://ggac.kr/artists/acmein",
  },
];

// ── 「木자르기」(2026-10-10 풍천리 마을회관 앞) ─────────────────────────────
// 세 번째 자리. 앞선 둘과 성격이 다르다 — 8·1 청와대 앞이 목소리를 서울로 올린
// 자리였고 9·5 마을 잔치가 하루쯤 웃는 자리였다면, 이번은 경고다. 2026년 1월
// 본공사가 착공됐고 이설도로 공사로 잣나무 2,256그루가 이미 쓰러졌다.
//
// 제목 표기 규칙: 히어로의 대형 타이포와 포스터만 「木자르기」로 쓰고, 메타데이터·
// 내비·본문은 전부 「목자르기」다. 한자를 이미지로 만들면 검색에 안 잡히고, 텍스트로만
// 두면 스크린리더가 "나무 자르기"로 읽어 말장난이 무너진다. 히어로에서 aria-label 로 보정한다.
export const MOK_TITLE = "목자르기";
/** 히어로 대형 타이포·포스터에만 쓰는 표기 */
export const MOK_TITLE_HANJA = "木자르기";
export const MOK_SUBTITLE_LINES = ["우리의 나무를 자르는 건", "우리의 목을 자르는 거야"];
export const MOK_DATE_LABEL = "2026년 10월 10일(토)";
export const MOK_TIME_LABEL = "오후 2시 시작";
export const MOK_PLACE = "풍천리 마을회관 앞";
export const MOK_ADDRESS = FEAST_ADDRESS;
export const MOK_START = new Date("2026-10-10T14:00:00+09:00");

/** 대책위 문의 — 마을 잔치와 같은 사람이다 */
export const MOK_PHONE_COMMITTEE = FEAST_PHONE_COMMITTEE;
export const MOK_PHONE_STAGE = CONCERT_PHONE;
export const MOK_PHONE_STAGE_NAME = CONCERT_PHONE_NAME;

// 무대 순서는 아직 정해지지 않았다. 그래서 ConcertSlot 배열을 만들지 않는다 —
// 확정되지 않은 시각을 표에 적으면 확정된 일정처럼 읽힌다. 라인업은 포스터 순서
// 그대로 이름만 보여주고, 순서가 나오면 그때 시각표를 붙인다.
//
// 순서는 대표 포스터(붉은 목) 기준이다. 초록 글리치 포스터는 VAN KIDEN 이 넷째
// 자리에 있어 둘이 어긋나는데, 대표로 쓰는 쪽을 따랐다.
export const MOK_LINEUP: ConcertArtist[] = [
  {
    name: "양차애",
    photo: "/images/concert/artists/yangchaae.jpg",
    photoCredit: "뉴스아트",
    blurb:
      "2인조 밴드 물장구클럽의 양차애. EP 「사랑타령」(2023), 싱글 「단꿈」(2024)·「You Want It」(2025)을 냈습니다.",
    source: "https://music.bugs.co.kr/artist/20193293",
  },
  {
    // 두 사람의 장르도 이력도 어느 출처로도 확인되지 않았다. 그래서 인물을 소개하지
    // 않고 무대를 소개한다 — 이 문장이 주장하는 사실은 b2b 라는 것과 장소뿐이고,
    // 둘 다 포스터에 적혀 있다. 지어낸 이력으로 칸을 채우느니 이편이 낫다.
    name: "DJ스탑원 x DJ괄",
    blurb:
      "두 사람이 번갈아 판을 올리는 b2b 세트. 마을회관 앞마당에 턴테이블이 놓입니다. 노래가 멎은 자리를 비트가 이어받습니다.",
  },
  {
    name: "사바하",
    photo: "/images/concert/artists/sabbaha.jpg",
    photoCredit: "경기아트콜렉티브",
    blurb:
      "2013년 솔로 프로젝트로 출발해 2023년 듀오로 자리잡은 둠드론 밴드. 리더 The Slaughter의 기타·보컬에 2025년 드러머 The Mortician이 합류해 서울·수원을 기반으로 활동합니다. 스스로 ‘사이비 오컬트 둠드론’이라 부릅니다. 2024년 정규 「THUNDER ROCKS」.",
    source: "https://ggac.kr/artists/sabbaha",
  },
  {
    name: "달 위의 콜린스",
    photo: "/images/concert/artists/collins-on-the-moon.jpg",
    photoCredit: "주최 측 제공",
    blurb:
      "홍대 클럽빵을 거점으로 공연해온 팀. 2025년 가을 두 달 사이에 싱글 「비둘기의 失樂園」·「PM 7:37」과 EP 「19.8㎡에서의 漂流記」, 앨범 「Thief 86」을 잇달아 냈습니다.",
    source: "https://indistreet.com/ko/artists/dalwiyikolrinseu",
  },
  {
    name: "박지휘",
    photo: "/images/concert/artists/parkjihwi.jpg",
    photoCredit: "주최 측 제공",
    blurb:
      "프리포크 싱어송라이터. 일러스트레이터 2da(이다)의 그림에서 따온 ‘sickbaby’라는 이름으로도 불렀습니다. 로파이한 프리포크로 시작해, 근래에는 엘리엇 스미스의 새드코어에 기운 곡을 씁니다.",
  },
  {
    name: "최양다음 NEXT",
    photo: "/images/concert/artists/next.jpg",
    photoCredit: "주최 측 제공",
    // 이름의 유래와 공연 이력은 본인이 링크트리에 공개해둔 이력서에서 왔다.
    // https://docs.google.com/document/d/16nwDjfv7_O2XZzg2Kr7af01oF1Vlb8YdASaFEUCoDGQ
    // 이력서에는 윤석열 퇴진 집회·팔레스타인 연대 집회 공연도 적혀 있으나, 이 페이지가
    // 소개할 것은 이 사람이 어떤 자리에서 노래해왔느냐이지 정당 사안이 아니라서
    // 대표적인 자리 셋만 적었다. 빼야 할 이유가 있으면 이 줄과 함께 지우면 된다.
    blurb:
      "독학으로 음악을 익힌 싱어송라이터. 아버지 성 ‘최’와 어머니 성 ‘양’에 ‘다음’을 붙인 이름으로, 호주제에 맞선다는 뜻을 담아 지었습니다. 그 이름을 여러 나라 말로 씁니다 — 다음, NEXT, 次, Nächste, 翌. 세월호 10주기 추모, 수요시위, 5·18 기념식 같은 자리에서 노래해왔습니다.",
    source: "https://www.instagram.com/nextisnexttoyou/",
  },
  {
    // 공개 자료가 하나도 없어 주최 측 소개글을 그대로 쓴다. 마쓰모토 코타·박지휘와
    // 같은 처리다 — source 를 비우는 것이 "공개 웹자료가 아니다"라는 표시다.
    name: "VAN KIDEN",
    photo: "/images/concert/artists/van-kiden.jpg",
    photoCredit: "주최 측 제공",
    blurb:
      "랩과 싱잉을 오가는 뮤지션. 2022년 싱글 「LIGHT」로 데뷔했습니다. 느끼는 감정을 그대로 전하고, 스스로에게 부끄럽지 않은 음악을 만들어가려 합니다.",
  },
];

// ── 예술연대 아카이브 ──────────────────────────────────────────────────────
// 공연은 정해진 주기 없이 열린다. 그래서 회차 번호를 쓰지 않고, 끝난 공연을
// 아래 배열에 최신순으로 쌓기만 한다. 다음 공연 날짜가 잡히면 upcoming: true 로
// 항목을 추가하면 /concert 목록 맨 위에 예정 공연으로 뜬다.
export interface ConcertEntry {
  /** /concert/{slug} */
  slug: string;
  /** D-day 계산 기준. 배너·히어로가 이 값만 보고 다음 공연을 안내한다. */
  startAt: Date;
  title: string;
  /** 내비 하위 메뉴에 쓰는 짧은 이름 */
  navLabel: string;
  dateLabel: string;
  timeLabel: string;
  place: string;
  posterImage: string;
  posterAlt: string;
  summary: string;
  lineupCount: number;
  /** 아직 열리지 않은 공연 */
  upcoming?: boolean;
}

export const CONCERTS: ConcertEntry[] = [
  {
    slug: "mok-jareugi",
    startAt: MOK_START,
    title: MOK_TITLE,
    navLabel: MOK_TITLE,
    dateLabel: MOK_DATE_LABEL,
    timeLabel: MOK_TIME_LABEL,
    place: MOK_PLACE,
    posterImage: "/images/concert/mok-jareugi-poster.jpg",
    posterAlt: "목자르기 공연 포스터 — 2026년 10월 10일 토요일 오후 2시, 풍천리 마을회관 앞",
    summary:
      "우리의 나무를 자르는 건 우리의 목을 자르는 거야. 본공사가 착공됐고 톱날은 이미 숲의 가장자리를 지났습니다. 벌목을 앞둔 잣나무 숲 앞에서 음악가 7팀이 경고합니다.",
    lineupCount: MOK_LINEUP.length,
    upcoming: true,
  },
  {
    slug: "village-feast",
    startAt: FEAST_START,
    title: FEAST_TITLE,
    navLabel: FEAST_TITLE,
    dateLabel: FEAST_DATE_LABEL,
    timeLabel: FEAST_TIME_LABEL,
    place: FEAST_PLACE,
    posterImage: "/images/concert/village-feast-poster.jpg",
    posterAlt: "풍천리 잣나무 마을 잔치 포스터 — 2026년 9월 5일 토요일 오후 1시",
    summary:
      "이번엔 음악가들이 마을로 내려옵니다. 8년째 싸워온 사람들이 하루쯤은 웃고 먹고 춤추는, 풍천리 마을회관 앞마당의 잔치입니다.",
    lineupCount: FEAST_LINEUP.length,
  },
  {
    slug: "before-cut",
    startAt: CONCERT_START,
    title: CONCERT_TITLE,
    navLabel: "베어지기 전에, 풍천리",
    dateLabel: CONCERT_DATE_LABEL,
    timeLabel: CONCERT_TIME_LABEL,
    place: CONCERT_PLACE,
    posterImage: "/images/concert/poster.jpg",
    posterAlt: "베어지기 전에 풍천리 공연 포스터",
    summary:
      "잣나무 11만 그루가 베어지기 전에, 풍천리를 지키려는 음악가 14팀이 청와대 앞에 모였습니다. 일곱 시간 동안 이어진 공연입니다.",
    lineupCount: CONCERT_LINEUP.length,
  },
];

/** 아직 열리지 않은 공연(없으면 null) */
export function upcomingConcert(): ConcertEntry | null {
  return CONCERTS.find((concert) => concert.upcoming) ?? null;
}

/** 이미 열린 공연 — 목록에서 아카이브로 보여준다 */
export function pastConcerts(): ConcertEntry[] {
  return CONCERTS.filter((concert) => !concert.upcoming);
}
