import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

export function Logo({ size = "md", white = false }: LogoProps) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  const iconSizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-14 h-14" };

  return (
    <div className="flex items-center gap-2">
      <div className={`${iconSizes[size]} rounded-full bg-red-600 flex items-center justify-center`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
          <circle cx="8" cy="22" r="5" fill="white" />
          <circle cx="24" cy="22" r="5" fill="white" />
          <path d="M8 22 L16 8 L24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <circle cx="16" cy="8" r="2" fill="white" />
        </svg>
      </div>
      <div>
        <div className={`${sizes[size]} font-bold leading-none ${white ? "text-white" : "text-gray-900"}`}>
          Compass
        </div>
        <div className={`text-xs font-medium tracking-widest uppercase ${white ? "text-red-300" : "text-red-600"}`}>
          Motors
        </div>
      </div>
    </div>
  );
}
