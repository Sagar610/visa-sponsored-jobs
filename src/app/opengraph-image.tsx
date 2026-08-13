import { ImageResponse } from "next/og";

export const alt = "Visa Sponsored Jobs — UK Skilled Worker visa jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#12305b",
          color: "white",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              color: "#12305b",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            VS
          </div>
          VISA SPONSORED JOBS
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
            UK Skilled Worker visa jobs at licensed sponsors
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#dbe3ee", maxWidth: 860 }}>
            Live vacancies · Home Office register · daily visa news
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#9fb3cc" }}>Developed by Sagar Gondaliya</div>
      </div>
    ),
    { ...size }
  );
}
