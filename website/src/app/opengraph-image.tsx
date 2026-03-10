import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "풍천리를 지켜주세요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background drone photo of 풍천리 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Dark overlay for text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "60px",
          }}
        >
          {/* Main title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "24px",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            풍천리를 지켜주세요
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              lineHeight: 1.4,
              marginBottom: "48px",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            7년, 680번의 외침 — 양수발전소 건설 반대
          </div>

          {/* Divider */}
          <div
            style={{
              width: "80px",
              height: "3px",
              backgroundColor: "#D4A843",
              marginBottom: "32px",
            }}
          />

          {/* URL */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
            }}
          >
            pungcheonri.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
