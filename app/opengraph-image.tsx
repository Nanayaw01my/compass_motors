import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #DC2626 0%, #7f1d1d 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Logo circle */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
      }}>
        <div style={{ color: "white", fontSize: 48, fontWeight: 900 }}>CM</div>
      </div>

      <div style={{ color: "white", fontSize: 72, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>
        Compass Motors
      </div>
      <div style={{ color: "#fca5a5", fontSize: 28, fontWeight: 600, marginTop: 16, letterSpacing: "2px" }}>
        INSTALLMENT MANAGEMENT SYSTEM
      </div>
      <div style={{
        marginTop: 40,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: "12px 32px",
        color: "white",
        fontSize: 22,
        fontWeight: 600,
      }}>
        compassmotors.online
      </div>
    </div>,
    { ...size }
  );
}
