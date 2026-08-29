import { ImageResponse } from "next/og";
import { SITE_HOST, SITE_URL } from "@/lib/site-config";

export const runtime = "edge";
export const alt = "우리가 나무다 — 풍천리 국민 연대서명";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 이 카드에 실제로 찍히는 글자들. Google Fonts의 text= 서브셋에 그대로 넘긴다.
// (src/app/opengraph-image.tsx와 같은 패턴 — 아래 loadKoreanFont 주석 참고.)
const EYEBROW = "국민 연대서명";
const TITLE = "우리가 나무다";
const SUBTITLE = "홍천 풍천리 양수발전소 백지화 · 숲과 계곡을 지키는 서명";
// 성명서(copy/statement.ts)에 있는 사실 그대로만 고른다 — 서명 수·목표치처럼
// 시간이 지나면 달라지는 값은 넣지 않는다(카드 하단 주석 참고).
const STATS = ["사라질 나무 111,999그루", "물에 잠기는 51가구", "지켜온 8년"];
// petition-statement.ts의 closing.p2와 정확히 같은 문장 — 성명서의 맺음 문구를
// 그대로 인용한다(check-petition-og.mjs가 이 일치를 단언한다).
//
// 원래는 이 아래에 보조 문구("1937년부터 이어온 숲 · 국내 잣 생산량 62%…")를 한 줄
// 더 넣었지만 뺐다 — 카드가 300px 폭 타임라인에서 렌더될 때(실제 공유 환경) 18px
// 텍스트는 몇 픽셀로 짓눌려 어차피 안 읽힌다. 안 읽힐 정보를 넣는 건 공간과 스크림
// 대비 예산만 쓰는 것이라, 제목·부제·수치 3종·맺음 문구로 줄였다.
const CAPTION = "풍천리를 그대로. 숲을 그대로. 생명을 그대로.";

const OG_TEXT = [EYEBROW, TITLE, SUBTITLE, ...STATS, CAPTION, SITE_HOST].join("");

/**
 * satori(next/og)는 fonts를 주지 않으면 라틴 기본 폰트만 쓴다. 한글 글리프가 없으면
 * 그 글자를 조용히 건너뛰어, 텍스트가 통째로 빈 카드가 만들어진다.
 *
 * public/fonts의 Pretendard는 woff2라 satori가 읽지 못하므로(ttf/otf/woff만 지원),
 * 이 카드에 쓰이는 글자만 담은 TTF 서브셋을 Google Fonts에서 받아 쓴다.
 * 실패하면 폰트 없이 렌더한다 — 한글은 비지만 이미지 생성 자체는 깨지지 않는다.
 */
async function loadKoreanFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}` +
      `&text=${encodeURIComponent(OG_TEXT)}`;
    // User-Agent를 보내지 않으면 Google이 truetype을 준다(브라우저 UA를 보내면 woff2가
    // 오는데, satori는 woff2를 읽지 못한다). woff/otf도 satori가 처리하므로 함께 허용한다.
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/,
    );
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const [bold, regular] = await Promise.all([loadKoreanFont(700), loadKoreanFont(400)]);
  const fonts = [
    bold ? { name: "NotoSansKR", data: bold, weight: 700 as const, style: "normal" as const } : null,
    regular ? { name: "NotoSansKR", data: regular, weight: 400 as const, style: "normal" as const } : null,
  ].filter((f) => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#111111",
          color: "#FFFFFF",
          fontFamily: "NotoSansKR",
        }}
      >
        {/* 처음에는 /petition 히어로 사진(연대 집회 사진)을 그대로 썼는데, 인물·
            현수막의 흰 글씨가 화면 전체에 흩어져 있어 어디에 텍스트를 얹어도 그
            지점의 국소 대비가 튀었다(리뷰에서 실측 확인 — 특히 부제·하단 문구가
            현수막 위에서 거의 안 읽혔다). 루트 카드가 잘 읽히는 이유는 배경이
            "질감은 있되 균질한" 항공 사진이기 때문이다. 그래서 근경 잣나무숲
            사진으로 바꿨다 — "우리가 나무다"라는 이 캠페인의 은유와도 더 맞고,
            안개 낀 능선 전체가 캔버스 하단 2/3(실제 텍스트가 놓이는 영역)를
            고르게 채워 어느 지점에 글자를 얹어도 국소 대비가 비슷하다.
            public/images의 다른 숲 사진 후보들도 열어봤지만(forest-landscape는
            하단에 밝은 바위, mountain-forest·forest-aerial은 우측에 강한 역광/
            수면 반사) 이 사진만 좌측·하단이 실제로 균질했다. */}
        <img
          src={`${SITE_URL}/images/pine-forest-1.jpg`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* 사진을 바꿨어도 스크림은 여전히 필요하다 — 안개 낀 상단은 밝고, 텍스트가
            실제로 앉는 하단 2/3는 초기값(0.32~0.88)보다 더 일찍, 더 짙게 어둡혀야
            흰 글씨가 어떤 배경에서도 안정적으로 읽힌다. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8, 14, 6, 0.18) 0%, rgba(8, 14, 6, 0.58) 28%, rgba(8, 14, 6, 0.90) 58%, rgba(8, 14, 6, 0.95) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "52px 56px 44px",
          }}
        >
          {/* eyebrow 배지는 --color-warm(#C75000, 액션 컬러)을 쓴다 — 홈 카드의
              earth-light 금색 배지(정보성 위치 표시)와 달리, 이 카드는 "서명하기"라는
              행동을 표시하므로 사이트의 액션 컬러 역할을 그대로 가져온다. */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 18px",
              borderRadius: "999px",
              backgroundColor: "#C75000",
              color: "#FFFFFF",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {EYEBROW}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "880px",
              }}
            >
              <div
                style={{
                  fontSize: "88px",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  textShadow: "0 8px 32px rgba(0,0,0,0.28)",
                }}
              >
                {TITLE}
              </div>
              <div
                style={{
                  fontSize: "31px",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.02em",
                }}
              >
                {SUBTITLE}
              </div>
            </div>

            {/* 통계 배지는 --color-forest(브랜드 보조색) 톤으로 — 홈 카드의 흰색
                반투명 배지와 형제이되, 숲이라는 이 캠페인의 브랜드 색을 얹는다. */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                maxWidth: "1000px",
              }}
            >
              {STATS.map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(20, 34, 12, 0.66)",
                    border: "1px solid rgba(120, 190, 70, 0.5)",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.96)",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingTop: "22px",
                borderTop: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.97)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                {CAPTION}
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.76)",
                }}
              >
                {SITE_HOST}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );
}
