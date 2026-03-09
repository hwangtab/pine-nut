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
          backgroundColor: "#2D5016",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#D4A843",
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "24px",
          }}
        >
          풍천리를 지켜주세요
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.75)",
            textAlign: "center",
            lineHeight: 1.4,
            marginBottom: "48px",
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
            color: "rgba(255, 255, 255, 0.5)",
            textAlign: "center",
          }}
        >
          pungcheonri.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
