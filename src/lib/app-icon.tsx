import { ImageResponse } from "next/og";

// The home-screen icon (iPhone, Mac, Android): the same house logo as the site header
// (src/components/Logo.tsx): white house, gold ቤ-shaped door, on flat forest green.
// Full-bleed square; phones round the corners themselves.
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#447656" }}>
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path
            d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2" fill="none" stroke="#f5c75a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20.1" cy="23.3" r="1.3" fill="none" stroke="#f5c75a" strokeWidth="1.6" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
