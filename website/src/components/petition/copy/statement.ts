/**
 * 성명서 본문 데이터.
 *
 * 「홍천 풍천리 양수발전소 건설 백지화와 풍천리 숲·계곡 보전을 촉구하는 성명서」 전문.
 *
 * 사실·수치를 한 글자도 바꾸지 말 것. 이 제목은 PetitionConsentFields의 동의 문구
 * (copy/form.ts의 privacyPrefix)가 「...」로 그대로 인용하고 있다 — 여기서 바꾸면
 * 그 인용의 정확성이 깨진다. scripts/check-petition-statement.mjs가 두 파일을
 * 대조해 어긋나면 실패한다.
 */

export interface StatementParagraph {
  key: string;
  defaultValue: string;
}

export interface StatementBlockCopy {
  headingKey: string;
  headingDefault: string;
  paragraphs: StatementParagraph[];
}

export interface StatementStatCopy {
  valueKey: string;
  valueDefault: string;
  labelKey: string;
  labelDefault: string;
}

export const petitionStatementTitle: StatementParagraph = {
  key: "petition.statement.title",
  defaultValue:
    "「홍천 풍천리 양수발전소 건설 백지화와 풍천리 숲·계곡 보전을 촉구하는 성명서」",
};

export const petitionStatementBlocks: StatementBlockCopy[] = [
  {
    headingKey: "petition.statement.block1.heading",
    headingDefault: "1937년부터 여기 있었다",
    paragraphs: [
      {
        key: "petition.statement.block1.p1",
        defaultValue:
          "풍천리 잣나무숲은 1937년부터 이 자리에 있었습니다. 산림청은 2017년 이 숲을 10대 명품숲으로 뽑았고, 지금도 대한민국 100대 명품숲에 들어 있습니다.",
      },
      {
        key: "petition.statement.block1.p2",
        defaultValue:
          "이 마을은 국내 잣 생산량의 62%를 책임집니다. 숲과 계곡은 몇 세대에 걸쳐 주민들이 살아온 자리이자, 사람 아닌 생명들의 자리이기도 합니다.",
      },
      {
        key: "petition.statement.block1.p3",
        defaultValue:
          "멸종위기 야생생물 Ⅰ급이자 천연기념물인 산양과 수달, 멸종위기 Ⅱ급인 담비가 이곳에 삽니다. 국가가 법으로 지키겠다고 한 동물들입니다.",
      },
    ],
  },
  {
    headingKey: "petition.statement.block2.heading",
    headingDefault: "111,999그루",
    paragraphs: [
      {
        key: "petition.statement.block2.p1",
        defaultValue:
          "이곳에 600MW 규모의 양수발전소가 추진되고 있습니다. 사업이 진행되면 나무 11만 1,999그루가 사라집니다. 이설도로 공사로 2,256그루는 이미 쓰러졌습니다.",
      },
      {
        key: "petition.statement.block2.p2",
        defaultValue:
          "숫자로 적으면 한 줄이지만, 한 그루마다 저마다의 시간이 있습니다. 그 나무에 기대어 사는 것들이 있고, 그것들끼리 얽혀 숲이 됩니다. 11만 1,999라는 숫자 뒤에 있는 건 셀 수 없는 관계와 세월입니다.",
      },
      {
        key: "petition.statement.block2.p3",
        defaultValue:
          "물에 잠기거나 집을 떠나야 하는 주민은 51가구입니다. 풍천리 사람들은 8년째 이 숲과 마을을 지키고 있습니다. 그 앞자리에 선 이들은 대개 이 마을에서 평생을 산 노인들입니다.",
      },
    ],
  },
  {
    headingKey: "petition.statement.block3.heading",
    headingDefault: "양수발전이라는 셈법",
    paragraphs: [
      {
        key: "petition.statement.block3.p1",
        defaultValue:
          "양수발전은 전기를 만드는 방식이 아닙니다. 전기를 써서 물을 높은 곳으로 끌어올린 뒤, 그 물을 내려보내며 다시 전기를 얻습니다. 발전소라기보다 저장 장치에 가깝습니다.",
      },
      {
        key: "petition.statement.block3.p2",
        defaultValue:
          "미국 에너지정보청(EIA)과 국립재생에너지연구소(NREL)는 양수발전의 왕복효율을 약 80%로 봅니다. 넣은 전기의 5분의 1가량이 저장하고 되찾는 과정에서 사라진다는 뜻입니다.",
      },
    ],
  },
  {
    headingKey: "petition.statement.block4.heading",
    headingDefault: "우리가 요구하는 것",
    paragraphs: [
      {
        key: "petition.statement.block4.violence",
        defaultValue:
          "이재명 정부는 절차와 법이란 핑계로 풍천리에 국가폭력을 행사하고 있습니다. 양수발전소 절차가 거짓이면 그것은 개발이 아니라 폭력입니다.",
      },
      {
        key: "petition.statement.block4.succession",
        defaultValue:
          "윤석열 정부가 밀어붙인 사업을 이재명 정부가 진행하려 합니다. 시골 노인 다 죽이는 사업으로 주민과 숲을 밀어버리겠다는 것입니까?",
      },
      {
        key: "petition.statement.block4.p1",
        defaultValue:
          "전력을 저장할 설비가 필요하다는 것 자체를 부정하지 않습니다. 우리가 요구하는 것은 확인입니다.",
      },
      {
        key: "petition.statement.block4.p2",
        defaultValue:
          "이 사업이 정말 필요한지, 실제 저장 효과와 손실은 얼마인지, 공공재원은 얼마나 들어가는지, 법적 판단의 근거는 무엇인지. 투명하게 밝혀주십시오. 그리고 풍천리의 숲과 계곡을 남겨둔 채로 필요한 전력 기능을 확보할 방법을 함께 찾아주십시오.",
      },
      {
        key: "petition.statement.block4.p3",
        defaultValue:
          "우리는 보상을 요구하는 것이 아닙니다. 풍천리의 숲과 계곡, 그 안의 생명들이 지금 그대로 남기를 바랄 뿐입니다.",
      },
    ],
  },
];

export const petitionStatementStats: StatementStatCopy[] = [
  {
    valueKey: "petition.statement.stats.trees.value",
    valueDefault: "111,999",
    labelKey: "petition.statement.stats.trees.label",
    labelDefault: "사라질 나무(그루)",
  },
  {
    valueKey: "petition.statement.stats.fallen.value",
    valueDefault: "2,256",
    labelKey: "petition.statement.stats.fallen.label",
    labelDefault: "이미 쓰러진 나무",
  },
  {
    valueKey: "petition.statement.stats.households.value",
    valueDefault: "51",
    labelKey: "petition.statement.stats.households.label",
    labelDefault: "이주 대상 가구",
  },
  {
    valueKey: "petition.statement.stats.jatShare.value",
    valueDefault: "62%",
    labelKey: "petition.statement.stats.jatShare.label",
    labelDefault: "국내 잣 생산 비중",
  },
  {
    valueKey: "petition.statement.stats.years.value",
    valueDefault: "8년",
    labelKey: "petition.statement.stats.years.label",
    labelDefault: "지켜온 세월",
  },
];

export const petitionStatementClosing: StatementParagraph[] = [
  {
    key: "petition.statement.closing.p1",
    defaultValue: "우리가 나무입니다. 나무도 우리와 함께 사는 생명입니다.",
  },
  {
    key: "petition.statement.closing.p2",
    defaultValue: "풍천리를 그대로. 숲을 그대로. 생명을 그대로.",
  },
];
