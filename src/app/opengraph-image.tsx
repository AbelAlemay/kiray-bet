import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The picture shown when any KirayBet link is shared (WhatsApp, Telegram, Facebook…):
// our own design with the logo, never a listing photo.

export const alt = "ኪራይ ቤት · KirayBet: homes for rent from our community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const forest = "#447656";
const gold = "#f5c75a";

// Menbere Bold (SIL Open Font License, see assets/fonts/OFL.txt): the site's Amharic font.
const font = await readFile(join(process.cwd(), "assets/fonts/Menbere-Bold.ttf"));

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          gap: 70,
          background: `linear-gradient(135deg, ${forest} 0%, #2f5a3f 100%)`,
          fontFamily: "Menbere",
        }}
      >
        {/* House logo with the ቤ-shaped door (same drawing as the site icon). */}
        <svg width="300" height="300" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#1c3a27" />
          <path
            d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20.1" cy="23.3" r="1.3" fill="none" stroke={gold} strokeWidth="1.6" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, color: gold, lineHeight: 1.1, textShadow: "0 4px 14px rgba(0,0,0,0.45)" }}>ኪራይ ቤት</div>
          <div style={{ fontSize: 64, color: "#fff", lineHeight: 1.2 }}>KirayBet</div>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.88)", marginTop: 24 }}>
            Homes for rent from our community
          </div>
          <div style={{ fontSize: 30, color: gold, marginTop: 14 }}>kiraybet.org</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Menbere", data: font, style: "normal", weight: 700 }] },
  );
}
