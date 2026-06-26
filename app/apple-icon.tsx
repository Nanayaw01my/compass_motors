import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#DC2626",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "40px",
      }}
    >
      <div style={{ color: "white", fontSize: 72, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>CM</div>
      <div style={{ color: "#fca5a5", fontSize: 18, fontWeight: 700, letterSpacing: "4px", marginTop: 6 }}>MOTORS</div>
    </div>,
    { ...size }
  );
}
