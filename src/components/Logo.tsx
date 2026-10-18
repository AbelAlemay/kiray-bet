// KirayBet mark: a simple house (roof, walls, door). Same drawing as src/app/icon.svg and
// the home-screen icon (src/lib/app-icon.tsx).
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-forest" />
      <path
        d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door shaped like ቤ: an arch (በ) with a small ring on the right leg */}
      <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2" fill="none" stroke="#f5c75a" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20.1" cy="23.3" r="1.3" fill="none" stroke="#f5c75a" strokeWidth="1.6" />
    </svg>
  );
}
