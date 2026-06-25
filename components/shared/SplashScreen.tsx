"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

function RealisticMotorcycle() {
  return (
    <svg
      viewBox="0 0 700 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 30px 60px rgba(220,38,38,0.45))" }}
    >
      <defs>
        {/* Tyre gradient — dark rubber */}
        <radialGradient id="tyre" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
        {/* Rim gradient */}
        <radialGradient id="rim" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#d0d0d0" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#333" />
        </radialGradient>
        {/* Brake disc */}
        <radialGradient id="disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#777" />
          <stop offset="100%" stopColor="#444" />
        </radialGradient>
        {/* Body red paint */}
        <linearGradient id="paint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2222" />
          <stop offset="40%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        {/* Highlight on fairing */}
        <linearGradient id="fairingHi" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        {/* Chrome/metal */}
        <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="35%" stopColor="#cccccc" />
          <stop offset="65%" stopColor="#888888" />
          <stop offset="100%" stopColor="#444444" />
        </linearGradient>
        {/* Frame metal */}
        <linearGradient id="frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        {/* Engine fins */}
        <linearGradient id="engine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="50%" stopColor="#444" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        {/* Seat */}
        <linearGradient id="seat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#222" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        {/* Headlight lens */}
        <radialGradient id="headlight" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fffde0" />
          <stop offset="60%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#cc9900" />
        </radialGradient>
        {/* Exhaust */}
        <linearGradient id="exhaust" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="50%" stopColor="#bbb" />
          <stop offset="100%" stopColor="#666" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Soft shadow filter */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
        </filter>
        {/* Spoke pattern */}
        <clipPath id="rearWheelClip">
          <circle cx="148" cy="222" r="68" />
        </clipPath>
        <clipPath id="frontWheelClip">
          <circle cx="530" cy="222" r="68" />
        </clipPath>
      </defs>

      {/* ─── Ground shadow ─── */}
      <ellipse cx="340" cy="298" rx="290" ry="16" fill="rgba(0,0,0,0.5)" />

      {/* ════ REAR WHEEL ════ */}
      <g style={{ transformOrigin: "148px 222px" }} className="wheel-spin">
        {/* Tyre outer */}
        <circle cx="148" cy="222" r="68" fill="url(#tyre)" />
        {/* Tyre wall detail */}
        <circle cx="148" cy="222" r="68" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="148" cy="222" r="60" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 6" />
        {/* Rim */}
        <circle cx="148" cy="222" r="50" fill="url(#rim)" />
        <circle cx="148" cy="222" r="50" fill="none" stroke="#555" strokeWidth="1.5" />
        {/* Brake disc */}
        <circle cx="148" cy="222" r="40" fill="url(#disc)" />
        <circle cx="148" cy="222" r="40" fill="none" stroke="#666" strokeWidth="1" />
        {/* Disc cooling holes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <circle key={i} cx={148 + 33 * Math.cos(a)} cy={222 + 33 * Math.sin(a)} r="3" fill="#2a2a2a" />;
        })}
        {/* Spokes — 7 double spokes */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i * (360 / 7) * Math.PI) / 180;
          const a2 = ((i * (360 / 7) + 8) * Math.PI) / 180;
          return (
            <g key={i}>
              <line x1={148 + 8 * Math.cos(a)} y1={222 + 8 * Math.sin(a)} x2={148 + 46 * Math.cos(a)} y2={222 + 46 * Math.sin(a)} stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={148 + 8 * Math.cos(a2)} y1={222 + 8 * Math.sin(a2)} x2={148 + 46 * Math.cos(a2)} y2={222 + 46 * Math.sin(a2)} stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          );
        })}
        {/* Hub */}
        <circle cx="148" cy="222" r="11" fill="#666" stroke="#999" strokeWidth="2" />
        <circle cx="148" cy="222" r="5" fill="#333" stroke="#777" strokeWidth="1.5" />
      </g>

      {/* ════ FRONT WHEEL ════ */}
      <g style={{ transformOrigin: "530px 222px" }} className="wheel-spin">
        <circle cx="530" cy="222" r="68" fill="url(#tyre)" />
        <circle cx="530" cy="222" r="68" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="530" cy="222" r="60" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="530" cy="222" r="50" fill="url(#rim)" />
        <circle cx="530" cy="222" r="50" fill="none" stroke="#555" strokeWidth="1.5" />
        <circle cx="530" cy="222" r="40" fill="url(#disc)" />
        <circle cx="530" cy="222" r="40" fill="none" stroke="#666" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <circle key={i} cx={530 + 33 * Math.cos(a)} cy={222 + 33 * Math.sin(a)} r="3" fill="#2a2a2a" />;
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i * (360 / 7) * Math.PI) / 180;
          const a2 = ((i * (360 / 7) + 8) * Math.PI) / 180;
          return (
            <g key={i}>
              <line x1={530 + 8 * Math.cos(a)} y1={222 + 8 * Math.sin(a)} x2={530 + 46 * Math.cos(a)} y2={222 + 46 * Math.sin(a)} stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={530 + 8 * Math.cos(a2)} y1={222 + 8 * Math.sin(a2)} x2={530 + 46 * Math.cos(a2)} y2={222 + 46 * Math.sin(a2)} stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          );
        })}
        <circle cx="530" cy="222" r="11" fill="#666" stroke="#999" strokeWidth="2" />
        <circle cx="530" cy="222" r="5" fill="#333" stroke="#777" strokeWidth="1.5" />
      </g>

      {/* ════ SWING ARM ════ */}
      <path d="M148 215 Q200 195 255 195 L260 230 Q210 228 152 228 Z" fill="url(#frame)" />
      <path d="M148 218 Q200 200 254 198" fill="none" stroke="#555" strokeWidth="2" />

      {/* ════ CHAIN ════ */}
      <path d="M185 228 Q220 238 248 228" fill="none" stroke="#555" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 3" />
      {/* Rear sprocket */}
      <circle cx="176" cy="222" r="20" fill="none" stroke="#444" strokeWidth="4" strokeDasharray="5 3" />
      {/* Front sprocket */}
      <circle cx="252" cy="225" r="14" fill="none" stroke="#444" strokeWidth="3" strokeDasharray="4 2" />

      {/* ════ EXHAUST ════ */}
      {/* Headers from engine */}
      <path d="M255 218 Q230 240 210 252 Q190 262 170 260 Q150 258 140 252" fill="none" stroke="#777" strokeWidth="9" strokeLinecap="round" />
      <path d="M258 212 Q232 232 212 244 Q194 254 172 252 Q154 250 144 244" fill="none" stroke="#555" strokeWidth="7" strokeLinecap="round" />
      {/* Muffler body */}
      <path d="M138 244 L110 240 L95 248 L110 258 L140 256 Z" fill="url(#exhaust)" />
      <path d="M96 244 L82 246 L82 256 L96 258 Z" fill="#888" />
      {/* Exhaust tip */}
      <ellipse cx="82" cy="251" rx="6" ry="10" fill="#555" stroke="#aaa" strokeWidth="1.5" />
      {/* Heat wrap texture on pipes */}
      <path d="M200 252 Q210 250 220 252" fill="none" stroke="#888" strokeWidth="1.5" />
      <path d="M215 248 Q225 246 235 248" fill="none" stroke="#888" strokeWidth="1.5" />

      {/* ════ MAIN FRAME ════ */}
      {/* Backbone */}
      <path d="M155 215 L200 135 L310 108 L390 128 L430 175 L420 222" fill="none" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      {/* Down tube */}
      <path d="M200 138 L230 195 L260 215" fill="none" stroke="#222" strokeWidth="10" strokeLinecap="round" />
      {/* Sub frame */}
      <path d="M200 135 L185 108 L220 100 L255 115 L260 140" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Rear sub frame */}
      <path d="M310 110 L300 88 L350 78 L400 95 L390 128" fill="none" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* ════ ENGINE BLOCK ════ */}
      {/* Main engine case */}
      <path d="M228 195 L232 150 L310 142 L320 195 Z" fill="url(#engine)" />
      <path d="M230 195 L235 158 L308 150 L318 195 Z" fill="#1a1a1a" opacity="0.4" />
      {/* Cylinder fins */}
      {[0,1,2,3,4,5].map((i) => (
        <rect key={i} x="238" y={152 + i * 7} width="62" height="5" rx="2" fill="#333" stroke="#444" strokeWidth="0.5" />
      ))}
      {/* Engine side cover */}
      <ellipse cx="228" cy="178" rx="22" ry="28" fill="#2a2a2a" stroke="#444" strokeWidth="1.5" />
      <ellipse cx="228" cy="178" rx="14" ry="18" fill="#333" />
      <circle cx="228" cy="178" r="6" fill="#555" stroke="#777" strokeWidth="1" />
      {/* Oil cooler */}
      <rect x="233" y="200" width="80" height="22" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
      {[0,1,2,3,4].map((i) => (
        <line key={i} x1={240 + i * 14} y1="202" x2={240 + i * 14} y2="220" stroke="#333" strokeWidth="2" />
      ))}

      {/* ════ FUEL TANK ════ */}
      <path d="M200 138 Q208 92 280 80 Q340 70 380 90 L390 128 L370 138 Q330 118 270 115 Q225 113 208 148 Z" fill="url(#paint)" />
      {/* Tank top highlight */}
      <path d="M220 118 Q270 98 340 96 Q370 96 385 106" fill="none" stroke="url(#fairingHi)" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
      {/* Tank seam line */}
      <path d="M215 132 Q260 110 340 108 L376 122" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      {/* Knee grip */}
      <path d="M215 130 L210 148 L225 148 L228 130 Z" fill="#111" opacity="0.5" rx="3" />
      <path d="M370 126 L378 142 L388 138 L382 122 Z" fill="#111" opacity="0.5" />
      {/* Tank cap */}
      <ellipse cx="295" cy="84" rx="16" ry="7" fill="#c0392b" stroke="#7f1d1d" strokeWidth="1.5" />
      <ellipse cx="295" cy="82" rx="8" ry="4" fill="#e74c3c" />

      {/* ════ UPPER FAIRING (sport/streetfighter) ════ */}
      {/* Headlight nacelle */}
      <path d="M390 128 Q430 118 470 115 Q510 112 540 132 L545 158 Q520 142 480 138 Q440 135 410 148 L400 165 Z" fill="url(#paint)" />
      <path d="M395 132 Q435 122 475 120 Q512 118 540 135" fill="none" stroke="url(#fairingHi)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      {/* Fairing lower */}
      <path d="M400 165 Q410 180 420 195 L450 195 Q445 178 440 165 Z" fill="#b91c1c" />
      {/* Fairing vent */}
      <path d="M408 148 L415 148 L415 165 L408 165 Z" fill="#111" opacity="0.5" rx="2" />
      <path d="M418 148 L424 148 L424 165 L418 165 Z" fill="#111" opacity="0.4" rx="2" />

      {/* ════ HEADLIGHT ════ */}
      {/* Housing */}
      <ellipse cx="548" cy="148" rx="26" ry="20" fill="#111" stroke="#333" strokeWidth="2" />
      {/* Inner lens */}
      <ellipse cx="548" cy="148" rx="20" ry="15" fill="url(#headlight)" filter="url(#glow)" />
      {/* DRL strip */}
      <path d="M530 136 L530 140" stroke="#ffe066" strokeWidth="3" strokeLinecap="round" />
      <path d="M527 142 Q538 138 550 138 Q562 138 568 142" fill="none" stroke="rgba(255,220,80,0.8)" strokeWidth="2" strokeLinecap="round" />
      {/* Headlight beam */}
      <path d="M564 140 L660 110" stroke="rgba(255,248,200,0.08)" strokeWidth="30" strokeLinecap="round" />
      <path d="M566 148 L660 148" stroke="rgba(255,248,200,0.06)" strokeWidth="20" strokeLinecap="round" />
      <path d="M564 156 L660 180" stroke="rgba(255,248,200,0.05)" strokeWidth="16" strokeLinecap="round" />

      {/* ════ FRONT FORK ════ */}
      {/* Left leg */}
      <path d="M490 132 L535 212" stroke="url(#chrome)" strokeWidth="10" strokeLinecap="round" />
      <path d="M494 130 L539 210" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M504 130 L549 210" stroke="url(#chrome)" strokeWidth="10" strokeLinecap="round" />
      <path d="M508 128 L553 208" stroke="rgba(255,255,255,0.12)" strokeWidth="4" strokeLinecap="round" />
      {/* Fork brace */}
      <path d="M500 175 L543 182" stroke="#555" strokeWidth="6" strokeLinecap="round" />
      {/* Triple tree */}
      <rect x="484" y="124" width="36" height="14" rx="4" fill="#333" stroke="#555" strokeWidth="1.5" />

      {/* ════ HANDLEBAR / COCKPIT ════ */}
      <path d="M390 102 Q400 82 416 76 L445 76" stroke="url(#chrome)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M390 100 Q402 80 418 74 L448 74" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Grip right */}
      <rect x="443" y="68" width="20" height="13" rx="6" fill="#222" stroke="#444" strokeWidth="1" />
      {/* Brake lever */}
      <path d="M463 72 L475 68" stroke="#888" strokeWidth="3" strokeLinecap="round" />
      {/* Instrument cluster */}
      <rect x="400" y="88" width="38" height="22" rx="5" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="405" y="92" width="28" height="14" rx="3" fill="#0a1a0a" />
      {/* Screen glow */}
      <rect x="406" y="93" width="26" height="12" rx="2" fill="rgba(0,200,100,0.15)" />
      <line x1="412" y1="96" x2="428" y2="96" stroke="rgba(0,255,100,0.5)" strokeWidth="1" />
      <line x1="410" y1="100" x2="426" y2="100" stroke="rgba(0,255,100,0.3)" strokeWidth="1" />

      {/* ════ SEAT ════ */}
      <path d="M210 132 Q250 110 320 108 Q370 106 400 120 L390 138 Q355 124 310 126 Q250 128 218 148 Z" fill="url(#seat)" />
      <path d="M215 138 Q255 118 315 116 Q360 114 388 126" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      {/* Seat stitch line */}
      <path d="M222 142 Q258 124 314 122 Q356 120 384 132" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 3" />
      {/* Pillion seat */}
      <path d="M310 110 Q345 104 380 114 L375 128 Q342 118 312 124 Z" fill="#111" />

      {/* ════ RIDER ════ */}
      {/* Boots */}
      <path d="M216 210 L210 240 L235 240 L238 220" fill="#111" />
      <rect x="207" y="236" width="32" height="10" rx="3" fill="#0a0a0a" stroke="#333" strokeWidth="1" />
      {/* Right boot */}
      <path d="M238 218 L235 240 L258 240 L260 222" fill="#111" />
      <rect x="233" y="236" width="30" height="10" rx="3" fill="#0a0a0a" stroke="#333" strokeWidth="1" />

      {/* Pants / lower body */}
      <path d="M210 165 L212 218 L240 218 L245 172" fill="#111" />
      <path d="M245 172 L252 218 L272 218 L268 168" fill="#111" />
      {/* Knee slider */}
      <ellipse cx="215" cy="200" rx="9" ry="12" fill="#333" stroke="#DC2626" strokeWidth="1.5" />
      <ellipse cx="260" cy="198" rx="9" ry="12" fill="#333" stroke="#DC2626" strokeWidth="1.5" />

      {/* Racing suit upper body — leaning aggressively forward */}
      <path d="M218 140 Q235 115 290 105 Q320 100 355 108 L350 132 Q318 122 285 128 Q248 136 232 158 Z" fill="#111" />
      {/* Suit seam / stripe */}
      <path d="M228 148 Q260 130 320 122 Q340 118 352 124" fill="none" stroke="#DC2626" strokeWidth="2.5" />
      <path d="M228 154 Q262 136 322 128 Q342 124 354 130" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.5" />
      {/* Back hump */}
      <path d="M280 108 Q310 95 348 100 L348 115 Q318 110 285 122 Z" fill="#0a0a0a" />
      {/* Shoulder protector */}
      <ellipse cx="232" cy="138" rx="14" ry="10" fill="#222" stroke="#333" strokeWidth="1.5" transform="rotate(-20 232 138)" />
      <ellipse cx="350" cy="120" rx="12" ry="9" fill="#222" stroke="#333" strokeWidth="1.5" transform="rotate(10 350 120)" />

      {/* Arm reaching to handlebar */}
      <path d="M350 120 Q380 108 402 100 Q418 96 430 88" fill="none" stroke="#111" strokeWidth="16" strokeLinecap="round" />
      <path d="M350 118 Q382 106 404 98 Q420 94 432 86" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      {/* Glove */}
      <ellipse cx="434" cy="82" rx="12" ry="9" fill="#0a0a0a" stroke="#222" strokeWidth="1" transform="rotate(-15 434 82)" />

      {/* ════ HELMET ════ */}
      {/* Shell */}
      <ellipse cx="302" cy="88" rx="36" ry="34" fill="#0d0d0d" />
      {/* Helmet base */}
      <path d="M270 100 Q272 118 302 120 Q332 118 334 100" fill="#111" stroke="#222" strokeWidth="1" />
      {/* Visor */}
      <path d="M274 85 Q290 68 320 72 Q338 76 336 92 L330 98 Q318 82 292 80 Q278 80 272 92 Z" fill="#DC2626" opacity="0.9" />
      {/* Visor tint */}
      <path d="M276 88 Q291 72 318 75 Q334 79 334 90" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="6" strokeLinecap="round" />
      {/* Helmet vent top */}
      <rect x="293" y="56" width="18" height="7" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
      <line x1="297" y1="57" x2="297" y2="62" stroke="#444" strokeWidth="1" />
      <line x1="302" y1="57" x2="302" y2="62" stroke="#444" strokeWidth="1" />
      <line x1="307" y1="57" x2="307" y2="62" stroke="#444" strokeWidth="1" />
      {/* Chin vent */}
      <path d="M284 108 Q302 112 320 108" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
      {/* Helmet racing graphic */}
      <path d="M270 90 Q280 76 302 72" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {/* Helmet shine */}
      <ellipse cx="288" cy="70" rx="10" ry="6" fill="rgba(255,255,255,0.08)" transform="rotate(-30 288 70)" />

      {/* ════ REAR FAIRING / TAIL ════ */}
      <path d="M200 130 L175 118 L168 106 L200 100 L222 112 Z" fill="#b91c1c" />
      <path d="M175 120 L170 108 L198 102 L220 114" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {/* Tail light */}
      <rect x="168" y="103" width="24" height="10" rx="4" fill="#DC2626" filter="url(#glow)" opacity="0.95" />
      <rect x="170" y="105" width="20" height="6" rx="3" fill="#ff4444" />
      {/* Turn signal */}
      <rect x="164" y="115" width="10" height="6" rx="2" fill="#ff6600" opacity="0.8" />

      {/* ════ FOOTPEGS ════ */}
      <path d="M255 220 L248 228" stroke="#666" strokeWidth="4" strokeLinecap="round" />
      <rect x="238" y="226" width="22" height="5" rx="2" fill="#555" stroke="#777" strokeWidth="1" />
      {/* Rear peg */}
      <path d="M310 225 L305 232" stroke="#666" strokeWidth="3" strokeLinecap="round" />
      <rect x="298" y="230" width="16" height="4" rx="2" fill="#555" />

      {/* ════ MIRRORS ════ */}
      <path d="M410 96 L398 78" stroke="#555" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="396" cy="74" rx="10" ry="7" fill="#222" stroke="#555" strokeWidth="1.5" transform="rotate(-20 396 74)" />
      <ellipse cx="396" cy="74" rx="7" ry="5" fill="#1a2a3a" transform="rotate(-20 396 74)" opacity="0.8" />
    </svg>
  );
}

export function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"riding" | "reveal" | "exit">("riding");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1900);
    const t2 = setTimeout(() => setPhase("exit"), 3400);
    const t3 = setTimeout(() => onComplete(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(145deg, #080808 0%, #150202 55%, #080808 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#DC2626 1px, transparent 1px), linear-gradient(90deg, #DC2626 1px, transparent 1px)",
              backgroundSize: "55px 55px",
            }}
          />

          {/* Road */}
          <div className="absolute bottom-[24%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
          <div className="absolute bottom-[23.5%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />

          {/* Speed lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px"
                style={{
                  top: `${32 + i * 5}%`,
                  width: `${40 + (i % 3) * 15}%`,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 0.55 - i * 0.02, repeat: Infinity, delay: i * 0.07, ease: "linear" }}
              />
            ))}
          </div>

          {/* Motorcycle */}
          <div
            className="absolute"
            style={{ bottom: "20%", left: 0, right: 0, perspective: "1000px", perspectiveOrigin: "center bottom" }}
          >
            <motion.div
              initial={{ x: "-115vw", rotateY: -10, scale: 0.8 }}
              animate={
                phase === "riding"
                  ? { x: ["-115vw", "-15vw", "12vw"], rotateY: [-10, -4, -1], scale: [0.8, 1.08, 1] }
                  : { x: "12vw", rotateY: -1, scale: 1 }
              }
              transition={
                phase === "riding"
                  ? { duration: 1.7, ease: [0.22, 0.61, 0.36, 1] }
                  : { duration: 0 }
              }
              style={{ width: "min(600px, 88vw)", margin: "0 auto", transformStyle: "preserve-3d" }}
            >
              {/* Dust / smoke behind rear wheel */}
              <motion.div
                className="absolute -left-6 bottom-2"
                animate={{ opacity: [0.6, 0], scale: [1, 3], x: [0, -80] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeOut" }}
              >
                {[0,1,2,3,4].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${8 + i * 5}px`,
                      height: `${8 + i * 5}px`,
                      top: `${-i * 10}px`,
                      left: `${-i * 8}px`,
                      background: `rgba(180,180,180,${0.25 - i * 0.04})`,
                    }}
                  />
                ))}
              </motion.div>

              <RealisticMotorcycle />
            </motion.div>
          </div>

          {/* Logo reveal */}
          <motion.div
            className="absolute top-[14%] flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -24 }}
            animate={phase === "reveal" ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl shadow-red-900/60">
                <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
                  <circle cx="8" cy="22" r="4" fill="white" />
                  <circle cx="24" cy="22" r="4" fill="white" />
                  <path d="M8 22 L16 8 L24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="16" cy="8" r="2.5" fill="white" />
                </svg>
              </div>
              <div>
                <div className="text-5xl font-bold text-white leading-none tracking-tight">Compass</div>
                <div className="text-base font-semibold tracking-[0.35em] text-red-400 uppercase mt-1">Motors</div>
              </div>
            </div>
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
              initial={{ width: 0 }}
              animate={phase === "reveal" ? { width: "260px" } : { width: 0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
            />
            <motion.p
              className="text-gray-500 text-xs tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={phase === "reveal" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.55 }}
            >
              Installment Management System
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            className="absolute bottom-[10%] flex gap-1.5"
            animate={phase === "reveal" ? { opacity: 0 } : { opacity: 1 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="rounded-full bg-red-600"
                style={{ width: 6, height: 6 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
