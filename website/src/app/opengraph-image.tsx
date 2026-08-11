import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site-config";

export const runtime = "edge";
export const alt = "풍천리를 지켜주세요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 이 카드에 실제로 찍히는 글자들. Google Fonts의 text= 서브셋에 그대로 넘긴다.
const EYEBROW = "강원도 홍천 화촌면 풍천리";
const TITLE = "풍천리를 지켜주세요";
const SUBTITLE = "잣나무 숲과 마을을 지키려는 7년의 싸움";
const STATS = ["705여 차례 집회", "140여 개 단체 연대", "51가구 수몰 위기"];
const CAPTION = "양수발전소 건설 반대 캠페인";
const CAPTION_SUB = "주민 생존권, 산림 생태계, 마을 공동체를 지키기 위한 기록";

const OG_TEXT = [EYEBROW, TITLE, SUBTITLE, ...STATS, CAPTION, CAPTION_SUB, SITE_HOST].join("");

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
        <img
          src="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(16, 23, 12, 0.08) 0%, rgba(16, 23, 12, 0.26) 34%, rgba(16, 23, 12, 0.84) 100%)",
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
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(212, 168, 67, 0.94)",
              color: "#1A1A1A",
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
                  fontSize: "76px",
                  fontWeight: 900,
                  lineHeight: 1.16,
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
                    backgroundColor: "rgba(255, 255, 255, 0.16)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
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
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  {CAPTION}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.70)",
                  }}
                >
                  {CAPTION_SUB}
                </div>
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
