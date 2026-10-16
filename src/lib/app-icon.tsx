import { ImageResponse } from "next/og";

// The home-screen icon (iPhone, Mac, Android): the house logo on a deep green gradient,
// with a filled gold ቤ-shaped door and a soft shadow so it reads at small sizes.
// Full-bleed square; phones round the corners themselves.
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 18%, #6fae82 0%, #447656 48%, #1f3d29 100%)",
        }}
      >
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 32 32">
          {/* Shadow */}
          <path
            d="M6.5 16.3 16 8.3l9.5 8M9 14.3V25.3h14V14.3"
            fill="none"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Walls, lit from inside */}
          <path d="M9 13.5 16 7.6l7 5.9V24.5H9Z" fill="rgba(255,255,255,0.12)" />
          <path
            d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Door shaped like ቤ */}
          <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2Z" fill="#f5c75a" />
          <circle cx="20.1" cy="23.1" r="1.35" fill="none" stroke="#f5c75a" strokeWidth="1.7" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
