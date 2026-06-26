import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 35% 30%, #f87171, #dc2626 50%, #7f1d1d)",
        borderRadius: "50%",
        boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.25)",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: "-0.5px",
          textShadow: "1px 2px 3px rgba(69,10,10,0.9)",
        }}
      >
        CM
      </div>
    </div>,
    { ...size }
  );
}
