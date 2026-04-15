import { ImageResponse } from "next/og";

export const alt = "HerMidlife — doctor-led midlife care for Australian women";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #FFF4F0 0%, #FDE6DE 35%, #F4DFEE 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(224, 137, 156, 0.35)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -100,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: "rgba(188, 162, 216, 0.4)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        {/* Top row — brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#C8455F",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1F1A24",
              letterSpacing: -0.5,
              display: "flex",
            }}
          >
            Her<span style={{ color: "#C8455F" }}>Midlife</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#C8455F",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 24,
              display: "flex",
            }}
          >
            For Australian women 35+
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "#1F1A24",
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Finally, a place where women are heard — not judged.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#1F1A24",
              opacity: 0.6,
              display: "flex",
            }}
          >
            Doctor-led perimenopause & midlife care
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1F1A24",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            hermidlife.org
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
