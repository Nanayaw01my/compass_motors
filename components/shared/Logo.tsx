import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

export function Logo({ size = "md", white = false }: LogoProps) {
  const iconSizes = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-16 h-16" };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  const subSizes  = { sm: "text-[9px]", md: "text-[11px]", lg: "text-sm" };

  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]}>
        <defs>
          {/* 3D main gradient — light top-left → dark bottom-right */}
          <linearGradient id="lg-main" x1="20%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%"   stopColor="#f87171" />
            <stop offset="45%"  stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Gloss highlight on top */}
          <linearGradient id="lg-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Rim gradient */}
          <linearGradient id="lg-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>

          <filter id="f-outer" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
          <filter id="f-text" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#450a0a" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* ── Depth shadow circle ── */}
        <circle cx="31.5" cy="32.5" r="26" fill="#450a0a" opacity="0.55" />

        {/* ── Main badge ── */}
        <circle cx="30" cy="30" r="26" fill="url(#lg-main)" filter="url(#f-outer)" />

        {/* ── Gloss overlay (top half) ── */}
        <ellipse cx="30" cy="19" rx="19" ry="13" fill="url(#lg-gloss)" />

        {/* ── Outer rim highlight ── */}
        <circle cx="30" cy="30" r="25.5" stroke="url(#lg-rim)" strokeWidth="1.2" fill="none" />

        {/* ── Inner ring ── */}
        <circle cx="30" cy="30" r="21" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />

        {/* ── 3D Text: deep shadow (farthest back) ── */}
        <text x="32" y="37" textAnchor="middle" fill="#450a0a"
          fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>

        {/* ── 3D Text: mid shadow ── */}
        <text x="31" y="36" textAnchor="middle" fill="#7f1d1d"
          fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>

        {/* ── 3D Text: main white face ── */}
        <text x="29.5" y="35" textAnchor="middle" fill="white" filter="url(#f-text)"
          fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>

        {/* ── 3D Text: top gloss on letters ── */}
        <text x="29.5" y="33" textAnchor="middle" fill="rgba(255,255,255,0.25)"
          fontSize="22" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">CM</text>

        {/* ── Bottom compass dot ── */}
        <circle cx="30" cy="51" r="2.5" fill="rgba(255,255,255,0.85)" />
        <polygon points="28.5,51 30,47 31.5,51" fill="rgba(255,255,255,0.85)" />
      </svg>

      {/* Text */}
      <div className="leading-none">
        <div className={`${textSizes[size]} font-black tracking-tight ${white ? "text-white" : "text-gray-900"}`}>
          Compass
        </div>
        <div className={`${subSizes[size]} font-bold tracking-[0.2em] uppercase ${white ? "text-red-300" : "text-red-600"} mt-0.5`}>
          Motors
        </div>
      </div>
    </div>
  );
}
