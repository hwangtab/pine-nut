import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site-config";

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
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#111111",
          color: "#FFFFFF",
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
            강원도 홍천 화촌면 풍천리
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
                풍천리를 지켜주세요
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
                잣나무 숲과 마을을 지키려는 7년의 싸움
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
              {[
                "680여 차례 집회",
                "140여 개 단체 연대",
                "51가구 수몰 위기",
              ].map((label) => (
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
                  양수발전소 건설 반대 캠페인
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.70)",
                  }}
                >
                  주민 생존권, 산림 생태계, 마을 공동체를 지키기 위한 기록
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
    }
  );
}
