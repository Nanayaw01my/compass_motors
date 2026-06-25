"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

function MotorcycleSVG() {
  return (
    <svg
      viewBox="0 0 420 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-2xl"
      style={{ filter: "drop-shadow(0 20px 40px rgba(220,38,38,0.5))" }}
    >
      <defs>
        <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#444" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
        <radialGradient id="tankGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff4444" />
          <stop offset="100%" stopColor="#991111" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="chromGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#888" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="210" cy="178" rx="170" ry="10" fill="rgba(0,0,0,0.35)" />

      {/* === REAR WHEEL === */}
      <g style={{ transformOrigin: "92px 148px" }} className="wheel-spin">
        {/* Tyre */}
        <circle cx="92" cy="148" r="42" fill="url(#wheelGrad)" />
        <circle cx="92" cy="148" r="36" fill="none" stroke="#2a2a2a" strokeWidth="12" />
        {/* Rim */}
        <circle cx="92" cy="148" r="24" fill="#1a1a1a" stroke="#555" strokeWidth="2" />
        {/* Spokes */}
        {[0, 30, 60, 90, 120, 150].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={92 + 6 * Math.cos(rad)}
              y1={148 + 6 * Math.sin(rad)}
              x2={92 + 22 * Math.cos(rad)}
              y2={148 + 22 * Math.sin(rad)}
              stroke="#777"
              strokeWidth="2"
            />
          );
        })}
        {/* Hub */}
        <circle cx="92" cy="148" r="7" fill="#888" stroke="#aaa" strokeWidth="1.5" />
      </g>

      {/* === FRONT WHEEL === */}
      <g style={{ transformOrigin: "328px 148px" }} className="wheel-spin">
        {/* Tyre */}
        <circle cx="328" cy="148" r="42" fill="url(#wheelGrad)" />
        <circle cx="328" cy="148" r="36" fill="none" stroke="#2a2a2a" strokeWidth="12" />
        {/* Rim */}
        <circle cx="328" cy="148" r="24" fill="#1a1a1a" stroke="#555" strokeWidth="2" />
        {/* Spokes */}
        {[0, 30, 60, 90, 120, 150].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={328 + 6 * Math.cos(rad)}
              y1={148 + 6 * Math.sin(rad)}
              x2={328 + 22 * Math.cos(rad)}
              y2={148 + 22 * Math.sin(rad)}
              stroke="#777"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="328" cy="148" r="7" fill="#888" stroke="#aaa" strokeWidth="1.5" />
      </g>

      {/* === REAR SWING ARM === */}
      <path d="M 92 148 L 150 130" stroke="url(#chromGrad)" strokeWidth="8" strokeLinecap="round" />

      {/* === EXHAUST PIPES === */}
      <path d="M 130 148 Q 100 158 82 162 Q 70 164 55 162" fill="none" stroke="#aaa" strokeWidth="6" strokeLinecap="round" />
      <path d="M 130 142 Q 102 152 84 156 Q 72 158 57 156" fill="none" stroke="#888" strokeWidth="4" strokeLinecap="round" />
      {/* Exhaust tip */}
      <ellipse cx="55" cy="159" rx="8" ry="5" fill="#777" stroke="#999" strokeWidth="1.5" />

      {/* === ENGINE BLOCK === */}
      <rect x="140" y="128" width="72" height="35" rx="6" fill="#222" stroke="#444" strokeWidth="1.5" />
      <rect x="148" y="135" width="16" height="20" rx="3" fill="#333" />
      <rect x="170" y="135" width="16" height="20" rx="3" fill="#333" />
      <rect x="192" y="135" width="16" height="20" rx="3" fill="#333" />

      {/* === MAIN FRAME === */}
      <path d="M 92 148 L 120 90 L 210 75 L 270 90 L 328 148" fill="none" stroke="#1a1a1a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 120 90 L 148 128" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <path d="M 210 75 L 212 128" stroke="#333" strokeWidth="7" strokeLinecap="round" />

      {/* === FUEL TANK === */}
      <path d="M 150 88 Q 155 62 210 58 Q 265 54 280 82 L 272 95 Q 245 85 210 82 Q 175 80 155 98 Z" fill="url(#tankGrad)" />
      {/* Tank highlight */}
      <path d="M 175 68 Q 200 62 230 65" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
      {/* Tank cap */}
      <ellipse cx="215" cy="62" rx="12" ry="5" fill="#c0392b" stroke="#7f1d1d" strokeWidth="1.5" />

      {/* === FAIRING / BODY === */}
      <path d="M 270 90 L 320 105 L 332 130 L 310 140 L 270 120 Z" fill="url(#bodyGrad)" />
      {/* Front fairing detail */}
      <path d="M 300 108 L 328 118" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* === SEAT === */}
      <path d="M 148 92 Q 185 82 215 85 Q 215 100 185 102 Q 155 105 148 95 Z" fill="#111" />
      <path d="M 152 92 Q 185 84 213 87" fill="none" stroke="#333" strokeWidth="2" />

      {/* === FRONT FORK === */}
      <line x1="270" y1="90" x2="310" y2="130" stroke="url(#chromGrad)" strokeWidth="7" strokeLinecap="round" />
      <line x1="278" y1="88" x2="318" y2="128" stroke="url(#chromGrad)" strokeWidth="5" strokeLinecap="round" />

      {/* === HEADLIGHT === */}
      <ellipse cx="332" cy="112" rx="14" ry="12" fill="#1a1a1a" stroke="#555" strokeWidth="2" />
      <ellipse cx="332" cy="112" rx="10" ry="8" fill="#fffbe0" opacity="0.9" filter="url(#glow)" />
      {/* Headlight beam */}
      <path d="M 342 108 L 420 90 M 342 112 L 420 112 M 342 116 L 420 130" stroke="rgba(255,251,224,0.15)" strokeWidth="2" />

      {/* === HANDLEBAR === */}
      <path d="M 278 85 Q 285 70 295 68 L 310 68" stroke="url(#chromGrad)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="308" y="63" width="14" height="10" rx="5" fill="#555" />

      {/* === RIDER SILHOUETTE === */}
      {/* Lower body / legs */}
      <path d="M 155 100 L 152 138 L 168 138 L 175 105" fill="#0a0a0a" />
      {/* Upper body - leaning forward */}
      <path d="M 165 100 Q 175 75 215 68 L 225 80 Q 200 88 180 108 Z" fill="#111" />
      {/* Helmet */}
      <circle cx="215" cy="58" r="22" fill="#111" />
      <path d="M 197 55 Q 210 35 232 50" fill="none" stroke="#333" strokeWidth="3" />
      {/* Visor */}
      <path d="M 200 55 Q 215 48 232 55 L 230 63 Q 215 58 202 63 Z" fill="#DC2626" opacity="0.8" />
      {/* Jacket highlight */}
      <path d="M 175 80 Q 192 72 212 70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      {/* Glove on handlebar */}
      <ellipse cx="302" cy="66" rx="10" ry="7" fill="#111" />

      {/* === REAR LIGHT === */}
      <rect x="102" y="100" width="18" height="10" rx="4" fill="#DC2626" opacity="0.9" filter="url(#glow)" />
    </svg>
  );
}

export function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"riding" | "reveal" | "exit">("riding");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1800);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(() => onComplete(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0f0f0f 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-red-500"
                style={{ top: `${(i + 1) * 8.33}%` }}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-red-500"
                style={{ left: `${(i + 1) * 8.33}%` }}
              />
            ))}
          </div>

          {/* Road / ground line */}
          <div className="absolute bottom-[28%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
          <div className="absolute bottom-[27.5%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-30" />

          {/* Speed lines that scroll */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                style={{ top: `${30 + i * 6}%`, width: "60%" }}
                animate={{ x: ["-60%", "160%"] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* 3D perspective container */}
          <div
            className="absolute"
            style={{
              bottom: "22%",
              left: 0,
              right: 0,
              perspective: "800px",
              perspectiveOrigin: "center bottom",
            }}
          >
            {/* Motorcycle motion */}
            <motion.div
              initial={{ x: "-110vw", rotateY: -8, scale: 0.85 }}
              animate={
                phase === "riding"
                  ? {
                      x: ["-110vw", "-20vw", "15vw"],
                      rotateY: [-8, -3, -1],
                      scale: [0.85, 1.05, 1],
                    }
                  : {
                      x: ["15vw", "15vw"],
                      rotateY: [-1, -1],
                      scale: [1, 1],
                    }
              }
              transition={
                phase === "riding"
                  ? { duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }
                  : { duration: 0 }
              }
              style={{
                width: "min(480px, 85vw)",
                margin: "0 auto",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Dust particles behind wheel */}
              <motion.div
                className="absolute -left-8 bottom-4"
                animate={{ opacity: [0.8, 0], scale: [1, 2.5], x: [-10, -60] }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeOut" }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-gray-400"
                    style={{
                      width: `${6 + i * 3}px`,
                      height: `${6 + i * 3}px`,
                      top: `${-i * 8}px`,
                      left: `${-i * 6}px`,
                      opacity: 0.3 - i * 0.06,
                    }}
                  />
                ))}
              </motion.div>

              <MotorcycleSVG />
            </motion.div>
          </div>

          {/* Logo reveal */}
          <motion.div
            className="absolute top-[18%] flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -30 }}
            animate={phase === "reveal" ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900">
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <circle cx="8" cy="22" r="5" fill="white" />
                  <circle cx="24" cy="22" r="5" fill="white" />
                  <path d="M8 22 L16 8 L24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="16" cy="8" r="2" fill="white" />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-bold text-white leading-none tracking-tight">Compass</div>
                <div className="text-sm font-semibold tracking-[0.3em] text-red-400 uppercase">Motors</div>
              </div>
            </div>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
              initial={{ width: 0 }}
              animate={phase === "reveal" ? { width: "200px" } : { width: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.p
              className="text-gray-400 text-sm tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={phase === "reveal" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              Installment Management
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="absolute bottom-[12%] flex gap-2"
            animate={phase === "reveal" ? { opacity: 0 } : { opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
