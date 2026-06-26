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
        background: "transparent",
      }}
    >
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <defs>
          <linearGradient id="g1" x1="20%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="31.5" cy="32.5" r="26" fill="#450a0a" opacity="0.55" />
        <circle cx="30" cy="30" r="26" fill="url(#g1)" />
        <ellipse cx="30" cy="19" rx="19" ry="13" fill="url(#g2)" />
        <circle cx="30" cy="30" r="25.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" />
        <text x="32" y="37" textAnchor="middle" fill="#450a0a" fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>
        <text x="31" y="36" textAnchor="middle" fill="#7f1d1d" fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>
        <text x="29.5" y="35" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>
      </svg>
    </div>,
    { ...size }
  );
}
