"use client";

import { useId } from "react";
import { cameraKindFor, type CameraKind } from "@/lib/cameras";

type Props = {
  /** Path to the design artwork SVG (300x640). */
  art: string;
  /** Phone model name, e.g. "iPhone 15 Pro" or "Galaxy S24 Ultra". Controls the camera cutout. */
  modelName?: string;
  brand?: string;
  className?: string;
  alt?: string;
};

const X = 250; // case origin inside the 800x800 canvas
const Y = 80;

function Lens({ cx, cy, r, ring = "#6b7280" }: { cx: number; cy: number; r: number; ring?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1f2937" stroke={ring} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#030712" stroke="#374151" strokeWidth={1.5} />
      <circle cx={cx - r * 0.2} cy={cy - r * 0.22} r={r * 0.14} fill="#fff" opacity={0.55} />
    </g>
  );
}

function Flash({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#fde68a" stroke="#d1d5db" strokeWidth={1.5} />;
}

function Dot({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#111827" stroke="#4b5563" strokeWidth={1} />;
}

function Module({ kind }: { kind: CameraKind }) {
  const glass = "#0b0f19";
  const edge = "#9ca3af";
  switch (kind) {
    case "single":
      return (
        <g>
          <rect x={24} y={24} width={72} height={72} rx={24} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={60} cy={60} r={22} />
          <Flash cx={112} cy={40} r={6} />
        </g>
      );
    case "ios-vertical":
      return (
        <g>
          <rect x={22} y={22} width={100} height={140} rx={30} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={54} cy={62} r={22} />
          <Lens cx={54} cy={122} r={22} />
          <Flash cx={98} cy={50} r={7} />
          <Dot cx={98} cy={132} r={4} />
        </g>
      );
    case "ios-diagonal":
      return (
        <g>
          <rect x={22} y={22} width={122} height={122} rx={32} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={58} cy={58} r={23} />
          <Lens cx={108} cy={108} r={23} />
          <Flash cx={108} cy={50} r={7} />
          <Dot cx={58} cy={110} r={4} />
        </g>
      );
    case "pill-vertical":
      return (
        <g>
          <rect x={22} y={22} width={74} height={140} rx={37} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={59} cy={62} r={22} />
          <Lens cx={59} cy={122} r={22} />
          <Flash cx={118} cy={44} r={6} />
        </g>
      );
    case "plateau-dual":
      return (
        <g>
          <rect x={14} y={22} width={272} height={100} rx={34} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={66} cy={72} r={26} />
          <Lens cx={136} cy={72} r={26} />
          <Flash cx={240} cy={56} r={8} />
          <Dot cx={240} cy={92} r={4} />
        </g>
      );
    case "plateau-single":
      return (
        <g>
          <rect x={14} y={22} width={272} height={88} rx={32} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={66} cy={66} r={27} />
          <Flash cx={240} cy={50} r={8} />
          <Dot cx={240} cy={82} r={4} />
        </g>
      );
    case "pro-triple":
      return (
        <g>
          <rect x={22} y={22} width={132} height={132} rx={34} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={58} cy={58} r={22} />
          <Lens cx={58} cy={120} r={22} />
          <Lens cx={114} cy={89} r={22} />
          <Flash cx={118} cy={46} r={7} />
          <Dot cx={118} cy={132} r={5} />
        </g>
      );
    case "plateau-triple":
      return (
        <g>
          <rect x={14} y={22} width={272} height={144} rx={36} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={64} cy={64} r={25} />
          <Lens cx={130} cy={64} r={25} />
          <Lens cx={97} cy={124} r={25} />
          <Flash cx={238} cy={58} r={8} />
          <Dot cx={238} cy={102} r={6} />
          <Dot cx={238} cy={130} r={3.5} />
        </g>
      );
    case "s-module-3":
      return (
        <g>
          <rect x={22} y={22} width={90} height={172} rx={18} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={52} cy={62} r={21} ring="#d1d5db" />
          <Lens cx={52} cy={112} r={21} ring="#d1d5db" />
          <Lens cx={52} cy={162} r={21} ring="#d1d5db" />
          <Flash cx={92} cy={46} r={5} />
          <Dot cx={92} cy={178} r={3.5} />
        </g>
      );
    case "s-module-4":
      return (
        <g>
          <rect x={22} y={22} width={150} height={190} rx={16} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={68} cy={76} r={34} ring="#d1d5db" />
          <Lens cx={68} cy={160} r={24} ring="#d1d5db" />
          <Lens cx={132} cy={52} r={18} ring="#d1d5db" />
          <Lens cx={132} cy={104} r={18} ring="#d1d5db" />
          <Flash cx={132} cy={150} r={6} />
          <Dot cx={132} cy={184} r={4} />
        </g>
      );
    case "s-contour-3":
      return (
        <g>
          <path d="M0 0 H128 Q150 0 150 24 V150 Q150 176 124 176 H0 Z" fill="#3b3a44" stroke={edge} strokeWidth={2.5} />
          <Lens cx={54} cy={44} r={20} ring="#d1d5db" />
          <Lens cx={54} cy={96} r={20} ring="#d1d5db" />
          <Lens cx={54} cy={148} r={20} ring="#d1d5db" />
          <Flash cx={108} cy={44} r={6} />
          <Dot cx={108} cy={150} r={3.5} />
        </g>
      );
    case "s-contour-4":
      return (
        <g>
          <path d="M0 0 H150 Q176 0 176 26 V170 Q176 196 150 196 H0 Z" fill="#3b3a44" stroke={edge} strokeWidth={2.5} />
          <Lens cx={56} cy={46} r={23} ring="#d1d5db" />
          <Lens cx={56} cy={110} r={23} ring="#d1d5db" />
          <Lens cx={56} cy={166} r={20} ring="#d1d5db" />
          <Lens cx={122} cy={78} r={22} ring="#d1d5db" />
          <Flash cx={126} cy={34} r={6} />
          <Dot cx={126} cy={146} r={4} />
        </g>
      );
    case "s-discrete-3":
      return (
        <g>
          <Lens cx={50} cy={58} r={22} ring="#d1d5db" />
          <Lens cx={50} cy={116} r={22} ring="#d1d5db" />
          <Lens cx={50} cy={174} r={22} ring="#d1d5db" />
          <Flash cx={98} cy={48} r={5.5} />
          <Dot cx={98} cy={176} r={3.5} />
        </g>
      );
    case "s-discrete-4":
      return (
        <g>
          <Lens cx={50} cy={58} r={22} ring="#d1d5db" />
          <Lens cx={50} cy={116} r={22} ring="#d1d5db" />
          <Lens cx={50} cy={174} r={22} ring="#d1d5db" />
          <Lens cx={50} cy={232} r={22} ring="#d1d5db" />
          <Flash cx={98} cy={48} r={5.5} />
          <Dot cx={98} cy={102} r={3.5} />
          <Dot cx={98} cy={220} r={3.5} />
        </g>
      );
    case "s-pill-2":
      return (
        <g>
          <rect x={24} y={24} width={70} height={128} rx={35} fill={glass} stroke={edge} strokeWidth={3} />
          <Lens cx={59} cy={62} r={21} ring="#d1d5db" />
          <Lens cx={59} cy={116} r={21} ring="#d1d5db" />
          <Flash cx={116} cy={44} r={5.5} />
        </g>
      );
  }
}

export default function CaseImage({ art, modelName = "iPhone 15 Pro", brand, className, alt }: Props) {
  const uid = useId().replace(/:/g, "");
  const kind = cameraKindFor(modelName);
  const samsung = brand ? brand === "Samsung" : modelName.startsWith("Galaxy");
  const rx = samsung ? 44 : 58;

  return (
    <svg
      viewBox="0 0 800 800"
      role="img"
      aria-label={alt ?? `Phone case for ${modelName}`}
      className={className ?? "h-full w-full"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3f4f8" />
          <stop offset="1" stopColor="#dfe3ee" />
        </linearGradient>
        <linearGradient id={`${uid}shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <filter id={`${uid}blur`}>
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id={`${uid}clip`}>
          <rect x={X} y={Y} width="300" height="640" rx={rx} />
        </clipPath>
      </defs>

      <rect width="800" height="800" fill={`url(#${uid}bg)`} />
      <ellipse cx="400" cy="738" rx="170" ry="22" fill="#000" opacity=".22" filter={`url(#${uid}blur)`} />
      <rect x={X - 12} y={Y - 12} width="324" height="664" rx={rx + 10} fill="#111827" opacity=".92" />

      <g clipPath={`url(#${uid}clip)`}>
        <image href={art} x={X} y={Y} width="300" height="640" preserveAspectRatio="xMidYMid slice" />
        <rect x={X} y={Y} width="300" height="640" fill={`url(#${uid}shine)`} />
        <g transform={`translate(${X} ${Y})`}>
          <Module kind={kind} />
        </g>
      </g>

      <rect x={X} y={Y} width="300" height="640" rx={rx} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
      <rect x={X + 290} y={Y + 150} width="6" height="70" rx="3" fill="#111827" />
      <rect x={X + 290} y={Y + 250} width="6" height="110" rx="3" fill="#111827" />
    </svg>
  );
}
