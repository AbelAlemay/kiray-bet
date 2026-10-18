// KirayBet mark: the same drawing as the home-screen icon (src/lib/app-icon.tsx) and
// src/app/icon.svg: a white house on a deep green gradient with a filled gold ቤ-shaped door.
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id="kb-logo-bg" cx="30%" cy="18%" r="95%">
          <stop offset="0%" stopColor="#6fae82" />
          <stop offset="48%" stopColor="#447656" />
          <stop offset="100%" stopColor="#1f3d29" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#kb-logo-bg)" />
      <g transform="translate(1.6 1.9) scale(0.9)">
        <path
          d="M6.5 16.3 16 8.3l9.5 8M9 14.3V25.3h14V14.3"
          fill="none"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 13.5 16 7.6l7 5.9V24.5H9Z" fill="rgba(255,255,255,0.12)" />
        <path
          d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Door shaped like ቤ: an arch (በ) with a small ring on the right leg */}
        <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2Z" fill="#f5c75a" />
        <circle cx="20.1" cy="23.1" r="1.35" fill="none" stroke="#f5c75a" strokeWidth="1.7" />
      </g>
    </svg>
  );
}
