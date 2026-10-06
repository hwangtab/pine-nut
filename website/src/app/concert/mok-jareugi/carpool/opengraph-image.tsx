import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site-config";

// 카드 내용이 고정이라 빌드 때 한 번만 만든다. 배경은 목자르기 공유 카드를 어둡게 깔아
// 공연 페이지와 같은 행사로 읽히게 한다.
export const alt = "목자르기 카풀 — 10월 10일(토) 서울에서 풍천리까지 같이 타고 가요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EYEBROW = "목자르기 · 10월 10일(토)";
const TITLE = "풍천리 같이 타고 가요";
const SUBTITLE = "빈자리를 골라 카풀을 신청하세요";
const PLACES = ["광화문", "강변역", "연신내역", "불광역", "뚝섬역"];
const PLACES_SUFFIX = "출발";

const OG_TEXT = [EYEBROW, TITLE, SUBTITLE, ...PLACES, PLACES_SUFFIX, SITE_HOST].join("");

// satori 는 woff2 를 못 읽는다 — 카드 글자만 담은 TTF 서브셋을 Google Fonts에서 받는다.
// (src/app/opengraph-image.tsx 와 같은 방식)
async function loadKoreanFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}` +
        `&text=${encodeURIComponent(OG_TEXT)}`,
    );
    if (!cssRes.ok) return null;
    const match = (await cssRes.text()).match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/,
    );
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return fontRes.ok ? await fontRes.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [bold, regular, background] = await Promise.all([
    loadKoreanFont(700),
    loadKoreanFont(400),
    readFile(path.join(process.cwd(), "public/images/concert/mok-jareugi-og.jpg")),
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
          backgroundColor: "#0E1A0B",
          color: "#FFFDF7",
          fontFamily: "NotoSansKR",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${background.toString("base64")}`}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(14,26,11,0.96) 0%, rgba(14,26,11,0.92) 60%, rgba(14,26,11,0.72) 100%)",
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
            padding: "60px 64px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 20px",
              borderRadius: "999px",
              backgroundColor: "#D7262E",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            {EYEBROW}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: "84px", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {TITLE}
            </div>
            <div style={{ fontSize: "34px", fontWeight: 400, color: "rgba(255,253,247,0.88)" }}>
              {SUBTITLE}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "18px", alignItems: "center" }}>
              {PLACES.map((place) => (
                <div
                  key={place}
                  style={{
                    display: "flex",
                    padding: "10px 20px",
                    borderRadius: "14px",
                    border: "2px solid rgba(255,253,247,0.7)",
                    fontSize: "30px",
                    fontWeight: 700,
                  }}
                >
                  {place}
                </div>
              ))}
              <div style={{ fontSize: "30px", fontWeight: 400, marginLeft: "6px" }}>{PLACES_SUFFIX}</div>
            </div>
          </div>

          <div style={{ fontSize: "22px", color: "rgba(255,253,247,0.7)" }}>{SITE_HOST}</div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
