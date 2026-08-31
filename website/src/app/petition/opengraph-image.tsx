import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site-config";

export const runtime = "edge";
export const alt = "비 내리는 풍천리 잣나무 숲 — 우리가 나무다";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 이 카드에 실제로 찍히는 글자들. Google Fonts의 text= 서브셋에 그대로 넘긴다.
// (src/app/opengraph-image.tsx와 같은 패턴 — 아래 loadKoreanFont 주석 참고.)
const EYEBROW = "연대서명";
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

const PUNGCHEONRI_FOREST_PHOTO =
  "https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003499236_std.jpg";

/**
 * 배경 사진도 폰트와 같은 위험을 안는다 — 원격 fetch다. next/og의 <img src="https://...">
 * 는 렌더링 중 satori가 자체적으로 그 URL을 가져오는데, 실패 시 동작이 보장되지 않는다
 * (루트 카드는 이 위험을 감수하고 그냥 <img src>를 쓴다). 여기서는 loadKoreanFont와 같은
 * 방식으로 직접 fetch해 data: URI로 미리 바꿔둔다 — 실패하면 null을 반환해 <img> 자체를
 * 아예 렌더하지 않고, 컨테이너의 backgroundColor(#111111)만 보이는 빈 카드로 대체한다.
 * 텍스트(제목·수치 등)는 사진 유무와 무관하게 항상 그려지므로, 사진이 빠져도 카드가
 * 완전히 깨지지는 않는다.
 */
async function loadBackgroundImage(): Promise<string | null> {
  try {
    const res = await fetch(PUNGCHEONRI_FOREST_PHOTO);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // edge 런타임에는 Node의 Buffer가 없다 — Web 표준 btoa로 직접 base64를 만든다.
    // 한 번에 문자열로 펴면 큰 이미지에서 콜스택을 넘길 수 있어 청크 단위로 나눈다.
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [bold, regular, backgroundImage] = await Promise.all([
    loadKoreanFont(700),
    loadKoreanFont(400),
    loadBackgroundImage(),
  ]);
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
        {/* 처음엔 /petition 히어로 사진(연대 집회 사진)을, 그다음엔 스톡 숲 사진
            (public/images/pine-forest-1.jpg)을 썼다. 둘 다 리뷰에서 문제가
            잡혔다 — 집회 사진은 인물·현수막 글씨가 화면 전체에서 국소 대비를
            튀게 했고, 스톡 사진은 "이 캠페인이 지키려는 특정한 숲"이 아니라
            일반 침엽수림이라 og:image:alt("풍천리 잣나무 숲")와 실제로 어긋났다.
            루트 카드가 이미 쓰는 방식 그대로 — Supabase의 실제 풍천리 사진으로
            바꿨다. 이 사진(ie003499236)은 홈 "마을 소개" 섹션이 alt="풍천리
            잣나무 숲 실제 풍경"으로 쓰는 바로 그 사진이고(HomeAboutSection.tsx),
            루트 카드의 드론 항공샷(ie003535387)과는 다른 사진이라 형제이되
            겹치지 않는다. 비 내리는 날 근경으로 찍혀 있다. */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* 이 사진은 명암 분포가 이전 사진들과 다르다 — 좌상단이 밝은 흰 하늘이고
            우하단으로 갈수록 어두운 숲이다(실제로 받아서 확인). 제목·부제가 있는
            좌측 상단~중단이 하필 가장 밝은 구간과 겹친다. 그래서 스크림을 두
            겹으로 쌓는다: (1) 좌상단에서 시작해 우하단으로 빠지는 대각선
            스크림으로 하늘을 직접 눌러 죽이고, (2) 기존의 상→하 스크림으로
            수치 배지·맺음 문구가 있는 하단을 마저 어둡힌다. 시작 불투명도도
            이전(0.18)보다 훨씬 높였다 — 이전 사진의 안개보다 이 사진의 흰
            하늘이 훨씬 밝기 때문이다. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(6, 10, 4, 0.92) 0%, rgba(6, 10, 4, 0.62) 32%, rgba(6, 10, 4, 0.22) 56%, rgba(6, 10, 4, 0) 74%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(6, 10, 4, 0.30) 0%, rgba(6, 10, 4, 0.60) 30%, rgba(6, 10, 4, 0.90) 60%, rgba(6, 10, 4, 0.95) 100%)",
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
