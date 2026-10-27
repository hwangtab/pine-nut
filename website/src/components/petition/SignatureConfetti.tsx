"use client";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function SignatureConfetti() {
  // 서명 직후 클라이언트 상태로만 렌더된다(SSR 없음) — 렌더 중에 읽어도 안전하다.
  if (prefersReducedMotion()) return null;

  const colors = ["#C75000", "#FF6B1A", "#2D5016", "#4A7A2E", "#D4A843", "#1B4965"];
  const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: (i * 17.3) % 100,
    delay: (i % 10) * 0.05,
    size: 6 + (i % 8),
    rotation: (i * 37) % 360,
    borderRadius: i % 2 === 0 ? "50%" : "2px",
    color: colors[i % colors.length],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {confettiPieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 2.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
