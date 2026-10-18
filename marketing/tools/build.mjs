// Builds KirayBet marketing assets (poster, social images, logos) as HTML, then renders
// them to PNG/PDF with Chrome. Usage: node build.mjs <outDir>
import { chromium } from "playwright-core";
import QRCode from "qrcode";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = process.argv[2];
const here = dirname(new URL(import.meta.url).pathname);
const skylines = JSON.parse(readFileSync(join(here, "skylines.json"), "utf8"));
const URL_TEXT = "kiraybet.org";
const URL_QR = "https://kiraybet.org";

const C = {
  bg: "#141311", surface: "#1e1c19", fg: "#f2eee8", muted: "#a69e92", border: "#34302a",
  forest: "#447656", forestDeep: "#2c4d38", brand: "#538159", door: "#f5c75a",
};

// ---------- pieces ----------
const iconSvg = (size, { rounded = true } = {}) => `
<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="${rounded ? 8 : 0}" fill="${C.forest}"/>
  <path d="M6.5 15.5 16 7.5l9.5 8M9 13.5V24.5h14V13.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13 24.5v-4.2a2.5 2.5 0 0 1 5 0v4.2" fill="none" stroke="${C.door}" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="20.1" cy="23.3" r="1.3" fill="none" stroke="${C.door}" stroke-width="1.6"/>
</svg>`;

// All 11 areas' landmarks side by side: the middle of each area's skyline.
const order = ["seattle", "portland", "bayarea", "socal", "denver", "austin", "dfw", "houston", "msp", "atlanta", "dmv"];
const skylineAll = (color, opacity) => `
<svg viewBox="0 0 ${order.length * 520} 220" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style="display:block">
  <g fill="${color}" opacity="${opacity}">
    ${order.map((id, i) => `<svg x="${i * 520}" y="0" width="560" height="220" viewBox="460 0 560 220" overflow="hidden">${skylines[id]}</svg>`).join("")}
  </g>
</svg>`;

const check = (color) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><circle cx="12" cy="12" r="12" fill="${C.forest}"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const qrSvg = await QRCode.toString(URL_QR, { type: "svg", errorCorrectionLevel: "H", margin: 0, color: { dark: "#141311", light: "#ffffff" } });

const fonts = `
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Menbere:wght@400;600;700&display=block" rel="stylesheet">`;

const base = (w, h, body, extraCss = "", bg = C.bg) => `<!doctype html><html><head><meta charset="utf-8">${fonts}
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${w}px;height:${h}px;background:${bg};}
  body{font-family:Geist,Menbere,system-ui,sans-serif;color:${C.fg};-webkit-font-smoothing:antialiased;overflow:hidden}
  .am{font-family:Menbere,Geist,sans-serif}
  ${extraCss}
</style></head><body>${body}</body></html>`;

const logoRow = (icon, nameSize, { light = false } = {}) => `
<div style="display:flex;align-items:center;gap:${Math.round(icon * 0.28)}px">
  ${iconSvg(icon)}
  <div style="line-height:1">
    <div class="am" style="font-size:${nameSize}px;font-weight:700;color:${light ? C.forest : C.door};${light ? "" : "text-shadow:0 3px 0 rgba(0,0,0,.45),0 0 28px rgba(245,199,90,.25)"}">ኪራይ ቤት</div>
    <div style="margin-top:${Math.round(nameSize * 0.14)}px;font-size:${Math.round(nameSize * 0.34)}px;font-weight:600;letter-spacing:.28em;color:${light ? "#5b554c" : C.muted}">KIRAYBET</div>
  </div>
</div>`;

const cities = "Denver · DC · Maryland · Virginia · Seattle · Dallas–Fort Worth · Austin · Houston · Minneapolis–Saint Paul · Portland · Atlanta · SF Bay Area · Southern California";

// ---------- the poster (1080 wide; height varies by format) ----------
function poster(h) {
  const tall = h >= 1800;
  const qr = tall ? 340 : 330;
  return base(1080, h, `
<div class="wrap">
  <div class="glow"></div>
  <div class="sky">${skylineAll("#3a4d3f", 0.55)}</div>
  <div class="content">
    <div style="display:flex;justify-content:center">${logoRow(92, 66)}</div>

    <div style="text-align:center">
      <div class="am head" style="color:${C.door}">ቤት ይፈልጋሉ?</div>
      <div class="am head">ቤት ያከራያሉ?</div>
      <div class="sub">Looking for a place? Have a place to rent?</div>
    </div>

    <div class="types">
      <span><b class="am">ሙሉ ቤት</b> House</span><span><b class="am">አፓርትመንት</b> Apartment</span><span><b class="am">ቤዝመንት</b> Basement</span><span><b class="am">ክፍል</b> Room</span>
    </div>

    <div class="mid">
      <ul class="perks">
        <li>${check("#fff")}<div><b class="am">ነጻ ነው</b><span>100% free to search and post</span></div></li>
        <li>${check("#fff")}<div><b class="am">ስልክ ቁጥር አያስፈልግም</b><span>No phone number, private chat</span></div></li>
        <li>${check("#fff")}<div><b class="am">አድራሻ በፈቃድ ብቻ</b><span>Exact address only with the host's OK</span></div></li>
        <li>${check("#fff")}<div><b class="am">በአማርኛና በእንግሊዝኛ</b><span>In Amharic and English</span></div></li>
      </ul>
      <div class="qrcard">
        <div class="qr" style="width:${qr}px;height:${qr}px">${qrSvg}<div class="qrlogo">${iconSvg(Math.round(qr * 0.22))}</div></div>
        <div class="scan"><span class="am">ስካን ያድርጉ</span> · Scan me</div>
      </div>
    </div>

    <div style="text-align:center">
      <div class="url">${URL_TEXT}</div>
      <div class="cities">${cities}</div>
    </div>
    <div class="foot">Open to everyone · Equal Housing Opportunity</div>
  </div>
</div>`, `
  .wrap{position:relative;width:1080px;height:${h}px;overflow:hidden;background:${C.bg}}
  .glow{position:absolute;inset:-20% -20% auto -20%;height:70%;background:radial-gradient(ellipse at 50% 30%, rgba(83,129,89,.45), rgba(83,129,89,0) 65%)}
  .sky{position:absolute;left:0;right:0;bottom:0;height:${tall ? 300 : 230}px;-webkit-mask-image:linear-gradient(to top,#000 40%,transparent)}
  .content{position:relative;height:100%;padding:${tall ? 110 : 64}px 72px ${tall ? 70 : 40}px;display:flex;flex-direction:column;justify-content:space-between;align-items:stretch}
  .head{font-size:${tall ? 124 : 106}px;font-weight:700;line-height:1.12;text-shadow:0 5px 0 rgba(0,0,0,.4)}
  .sub{margin-top:14px;font-size:${tall ? 40 : 36}px;color:${C.muted};font-weight:500}
  .types{display:flex;flex-wrap:nowrap;justify-content:center;gap:10px}
  .types span{border:2px solid ${C.border};background:rgba(30,28,25,.85);border-radius:999px;padding:9px 16px;font-size:21px;white-space:nowrap;color:${C.muted};font-weight:500}
  .types b{color:${C.fg};font-weight:700;margin-right:6px}
  .mid{display:flex;align-items:center;justify-content:space-between;gap:36px}
  .perks{list-style:none;display:flex;flex-direction:column;gap:${tall ? 30 : 22}px;flex:1}
  .perks li{display:flex;gap:18px;align-items:flex-start;font-size:40px}
  .perks li svg{flex-shrink:0;margin-top:2px}
  .perks b{display:block;font-size:${tall ? 36 : 32}px;font-weight:700;line-height:1.2}
  .perks span{display:block;font-size:${tall ? 25 : 23}px;color:${C.muted};margin-top:2px}
  .qrcard{background:#fff;border-radius:36px;padding:28px 28px 20px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 6px ${C.door};text-align:center}
  .qr{position:relative}
  .qr>svg{width:100%;height:100%;display:block}
  .qrlogo{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .qrlogo svg{background:#fff;border-radius:22%;padding:6px;box-sizing:content-box}
  .scan{margin-top:14px;font-size:30px;font-weight:700;color:${C.bg}}
  .url{font-size:${tall ? 96 : 84}px;font-weight:800;color:${C.door};letter-spacing:-.01em;text-shadow:0 4px 0 rgba(0,0,0,.45)}
  .cities{margin:12px auto 0;max-width:900px;font-size:21px;line-height:1.45;color:${C.muted}}
  .foot{text-align:center;font-size:18px;color:${C.muted};opacity:.85}
  `);
}

// ---------- banners (Facebook cover, X header) ----------
function banner(w, h) {
  return base(w, h, `
<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%, rgba(83,129,89,.5), rgba(83,129,89,0) 60%)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:${Math.round(h * 0.42)}px">${skylineAll("#3a4d3f", 0.6)}</div>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(h * 0.04)}px;padding-bottom:${Math.round(h * 0.1)}px">
    ${logoRow(Math.round(h * 0.2), Math.round(h * 0.15))}
    <div class="am" style="font-size:${Math.round(h * 0.085)}px;font-weight:700;text-shadow:0 3px 0 rgba(0,0,0,.4)"><span style="color:${C.door}">ቤት ይፈልጋሉ?</span> ቤት ያከራያሉ?</div>
    <div style="font-size:${Math.round(h * 0.048)}px;color:${C.muted};font-weight:500">Homes and rooms for rent from our community</div>
    <div style="font-size:${Math.round(h * 0.075)}px;color:${C.door};font-weight:800;text-shadow:0 3px 0 rgba(0,0,0,.45)">${URL_TEXT}</div>
  </div>
</div>`);
}

// ---------- logos ----------
const logoPage = (w, h, inner, bg) => base(w, h, `<div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center">${inner}</div>`, "", bg);

const stacked = (icon, light = false) => `
<div style="display:flex;flex-direction:column;align-items:center;gap:${Math.round(icon * 0.18)}px;text-align:center">
  ${iconSvg(icon)}
  <div class="am" style="font-size:${Math.round(icon * 0.5)}px;font-weight:700;line-height:1;color:${light ? C.forest : C.door};${light ? "" : "text-shadow:0 4px 0 rgba(0,0,0,.45)"}">ኪራይ ቤት</div>
  <div style="font-size:${Math.round(icon * 0.17)}px;font-weight:600;letter-spacing:.3em;color:${light ? "#5b554c" : C.muted};margin-top:-${Math.round(icon * 0.06)}px">KIRAYBET</div>
</div>`;

// Instagram highlight covers: a gold line icon on the logo green, centered for the circle crop.
const hl = {
  homes: `<path d="M10 30 32 12l22 18M16 26v24h32V26" /><path d="M27 50V40a5 5 0 0 1 10 0v10" stroke="${C.door}"/>`,
  rooms: `<path d="M12 44V22M12 36h40v8M52 44V32a6 6 0 0 0-6-6H28v10"/><circle cx="20" cy="30" r="4"/>`,
  safety: `<path d="M32 10l18 7v12c0 12-8 20-18 24-10-4-18-12-18-24V17z"/><path d="M24 32l6 6 11-12" stroke="${C.door}"/>`,
  post: `<path d="M10 30 32 12l22 18M16 26v24h32V26"/><path d="M32 32v12M26 38h12" stroke="${C.door}"/>`,
  howto: `<circle cx="32" cy="32" r="20"/><path d="M26 26a6 6 0 1 1 8 5.6c-1.5.7-2 1.6-2 3.4v1" stroke="${C.door}"/><circle cx="32" cy="43" r="1.2" fill="${C.door}" stroke="${C.door}"/>`,
};
const highlight = (key) => base(1080, 1920, `
<div style="width:1080px;height:1920px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 50%, #3d6a4e, ${C.forestDeep} 70%)">
  <svg width="640" height="640" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">${hl[key]}</svg>
</div>`);

// ---------- render ----------
const jobs = [
  // [file, html, width, height, scale]
  ["print/poster-letter.png", poster(1398), 1080, 1398, 2550 / 1080],
  ["social/poster-chat-and-instagram-post-1080x1350.png", poster(1350), 1080, 1350, 1],
  ["social/story-1080x1920.png", poster(1920), 1080, 1920, 1],
  ["social/facebook-cover-1640x624.png", banner(1640, 624), 1640, 624, 1],
  ["social/x-twitter-header-1500x500.png", banner(1500, 500), 1500, 500, 1],
  ["social/profile-picture-1080.png", logoPage(1080, 1080, iconSvg(1080, { rounded: false }), C.forest), 1080, 1080, 1],
  ["logos/icon-1024.png", logoPage(1024, 1024, iconSvg(1024), "transparent"), 1024, 1024, 1],
  ["logos/logo-horizontal-on-dark.png", logoPage(1600, 560, logoRow(300, 220), C.bg), 1600, 560, 1],
  ["logos/logo-horizontal-transparent.png", logoPage(1600, 560, logoRow(300, 220), "transparent"), 1600, 560, 1],
  ["logos/logo-horizontal-on-white.png", logoPage(1600, 560, logoRow(300, 220, { light: true }), "#ffffff"), 1600, 560, 1],
  ["logos/logo-stacked-on-dark.png", logoPage(1200, 1200, stacked(480), C.bg), 1200, 1200, 1],
  ["logos/logo-stacked-on-white.png", logoPage(1200, 1200, stacked(480, true), "#ffffff"), 1200, 1200, 1],
  ...Object.keys(hl).map((k) => [`social/instagram-highlight-${k}.png`, highlight(k), 1080, 1920, 1]),
];

mkdirSync(join(OUT, "src"), { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const [file, html, w, h, scale] of jobs) {
  const path = join(OUT, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(join(OUT, "src", file.replace(/\//g, "__").replace(/\.png$/, ".html")), html);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, omitBackground: html.includes("background:transparent"), fullPage: false });
  if (file === "print/poster-letter.png") {
    // Print PDF: the 300-dpi poster image on one US Letter page, edge to edge.
    const img = readFileSync(path).toString("base64");
    const pdfPage = await browser.newPage();
    await pdfPage.setContent(`<style>@page{size:8.5in 11in;margin:0}html,body{margin:0}img{display:block;width:8.5in;height:11in}</style><img src="data:image/png;base64,${img}">`);
    await pdfPage.pdf({ path: join(OUT, "print/poster-letter.pdf"), width: "8.5in", height: "11in", printBackground: true, pageRanges: "1" });
    await pdfPage.close();
  }
  await page.close();
  console.log("✓", file);
}
writeFileSync(join(OUT, "logos/icon.svg"), iconSvg(1024).trim() + "\n");
await browser.close();
