"use client";

export function PineTreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <polygon points="32,0 12,28 22,28 8,52 18,52 4,76 60,76 46,52 56,52 42,28 52,28" />
      <rect x="28" y="76" width="8" height="20" />
    </svg>
  );
}

export function MountainSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none z-[2]">
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="block w-full h-24 sm:h-[120px] md:h-[200px]"
      >
        <path
          d="M0,320 L0,220 Q120,120 240,180 Q360,100 480,160 Q600,60 720,140 Q840,80 960,130 Q1080,50 1200,120 Q1320,70 1440,160 L1440,320 Z"
          fill="rgba(45,80,22,0.3)"
        />
        <path
          d="M0,320 L0,260 Q180,180 360,240 Q540,150 720,210 Q900,140 1080,200 Q1260,160 1440,220 L1440,320 Z"
          fill="rgba(45,80,22,0.5)"
        />
        <path
          d="M0,320 L0,280 Q100,250 200,270 Q300,240 400,265 Q500,235 600,260 Q700,230 800,255 Q900,225 1000,250 Q1100,230 1200,260 Q1300,240 1440,270 L1440,320 Z"
          fill="rgba(26,50,12,0.7)"
        />
      </svg>
    </div>
  );
}
