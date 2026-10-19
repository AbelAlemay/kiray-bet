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

// ---------- palettes: dark (screens) and light (cheap to print) ----------
const dark = {
  bg: C.bg, fg: C.fg, muted: C.muted, border: C.border, pill: "rgba(30,28,25,.85)", head1: C.door, accent: C.door,
  ring: C.door, sky: "#3a4d3f", glow: "rgba(83,129,89,.45)", shadow: "0 5px 0 rgba(0,0,0,.4)", light: false,
};
const light = {
  bg: "#ffffff", fg: "#1c1a17", muted: "#5b554c", border: "#d9d3c8", pill: "#f6f3ee", head1: C.forest, accent: C.forest,
  ring: C.forest, sky: "#e3ebe5", glow: "rgba(83,129,89,.14)", shadow: "none", light: true,
};
const socialsLine = `Instagram @kiraybet.us · facebook.com/kiraybetus · t.me/kiraybetus`;

// ---------- the poster (1080 wide; height varies by format) ----------
function poster(h, P = dark) {
  const tall = h >= 1800;
  const qr = tall ? 340 : 320;
  return base(1080, h, `
<div class="wrap">
  <div class="glow"></div>
  <div class="sky">${skylineAll(P.sky, P.light ? 1 : 0.55)}</div>
  <div class="content">
    <div style="display:flex;justify-content:center">${logoRow(92, 66, { light: P.light })}</div>

    <div style="text-align:center">
      <div class="am head" style="color:${P.head1}">ቤት ይፈልጋሉ?</div>
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
      <div class="socials">${socialsLine}</div>
    </div>
    <div class="foot">Open to everyone · Equal Housing Opportunity</div>
  </div>
</div>`, `
  body{color:${P.fg}}
  .wrap{position:relative;width:1080px;height:${h}px;overflow:hidden;background:${P.bg}}
  .glow{position:absolute;inset:-20% -20% auto -20%;height:70%;background:radial-gradient(ellipse at 50% 30%, ${P.glow}, rgba(83,129,89,0) 65%)}
  .sky{position:absolute;left:0;right:0;bottom:0;height:${tall ? 300 : 220}px;-webkit-mask-image:linear-gradient(to top,#000 40%,transparent)}
  .content{position:relative;height:100%;padding:${tall ? 110 : 60}px 72px ${tall ? 70 : 36}px;display:flex;flex-direction:column;justify-content:space-between;align-items:stretch}
  .head{font-size:${tall ? 124 : 100}px;font-weight:700;line-height:1.12;text-shadow:${P.shadow}}
  .sub{margin-top:12px;font-size:${tall ? 40 : 34}px;color:${P.muted};font-weight:500}
  .types{display:flex;flex-wrap:nowrap;justify-content:center;gap:10px}
  .types span{border:2px solid ${P.border};background:${P.pill};border-radius:999px;padding:9px 16px;font-size:21px;white-space:nowrap;color:${P.muted};font-weight:500}
  .types b{color:${P.fg};font-weight:700;margin-right:6px}
  .mid{display:flex;align-items:center;justify-content:space-between;gap:36px}
  .perks{list-style:none;display:flex;flex-direction:column;gap:${tall ? 30 : 20}px;flex:1}
  .perks li{display:flex;gap:18px;align-items:flex-start;font-size:40px}
  .perks li svg{flex-shrink:0;margin-top:2px}
  .perks b{display:block;font-size:${tall ? 36 : 31}px;font-weight:700;line-height:1.2}
  .perks span{display:block;font-size:${tall ? 25 : 22}px;color:${P.muted};margin-top:2px}
  .qrcard{background:#fff;border-radius:36px;padding:26px 26px 18px;box-shadow:${P.light ? "none" : "0 20px 60px rgba(0,0,0,.5),"} 0 0 0 6px ${P.ring};text-align:center}
  .qr{position:relative}
  .qr>svg{width:100%;height:100%;display:block}
  .qrlogo{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .qrlogo svg{background:#fff;border-radius:22%;padding:6px;box-sizing:content-box}
  .scan{margin-top:12px;font-size:28px;font-weight:700;color:${C.bg}}
  .url{font-size:${tall ? 96 : 80}px;font-weight:800;color:${P.accent};letter-spacing:-.01em;text-shadow:${P.light ? "none" : "0 4px 0 rgba(0,0,0,.45)"}}
  .cities{margin:10px auto 0;max-width:900px;font-size:20px;line-height:1.45;color:${P.muted}}
  .socials{margin-top:8px;font-size:21px;font-weight:600;color:${P.fg}}
  .foot{text-align:center;font-size:17px;color:${P.muted};opacity:.85}
  `);
}

// ---------- carousel / tip cards (1080x1350) ----------
const icons = {
  search: `<circle cx="28" cy="28" r="14"/><path d="M38 38l14 14"/>`,
  chat: `<path d="M12 16h40v26H30l-10 9v-9h-8z"/><path d="M22 27h20M22 33h12" stroke="${C.door}"/>`,
  key: `<circle cx="22" cy="32" r="9"/><path d="M31 32h22M46 32v7M52 32v5" stroke="${C.door}"/>`,
  home: `<path d="M10 30 32 12l22 18M16 26v24h32V26" /><path d="M27 50V40a5 5 0 0 1 10 0v10" stroke="${C.door}"/>`,
  post: `<path d="M10 30 32 12l22 18M16 26v24h32V26"/><path d="M32 32v12M26 38h12" stroke="${C.door}"/>`,
  money: `<rect x="10" y="18" width="44" height="28" rx="4"/><circle cx="32" cy="32" r="6" stroke="${C.door}"/><path d="M8 8l48 48" stroke="#f2827a"/>`,
  alert: `<path d="M32 10 56 52H8z"/><path d="M32 26v12" stroke="${C.door}"/><circle cx="32" cy="45" r="1.5" fill="${C.door}" stroke="${C.door}"/>`,
  shield: `<path d="M32 10l18 7v12c0 12-8 20-18 24-10-4-18-12-18-24V17z"/><path d="M24 32l6 6 11-12" stroke="${C.door}"/>`,
  swipe: `<path d="M14 32h34M38 22l10 10-10 10" stroke="${C.door}"/>`,
};

function card({ badge, num, titleAm, titleEn, bodyAm, bodyEn, icon, footer = true, qr = null, extra = "" }) {
  return base(1080, 1350, `
<div style="position:relative;width:1080px;height:1350px;overflow:hidden;background:${C.bg}">
  <div style="position:absolute;inset:-20% -20% auto -20%;height:65%;background:radial-gradient(ellipse at 50% 30%, rgba(83,129,89,.42), rgba(83,129,89,0) 65%)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:200px;-webkit-mask-image:linear-gradient(to top,#000 30%,transparent)">${skylineAll("#3a4d3f", 0.5)}</div>
  <div style="position:relative;height:100%;padding:70px 80px 56px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="border:2px solid ${C.door};color:${C.door};border-radius:999px;padding:10px 22px;font-size:26px;font-weight:700">${badge}</span>
      ${num ? `<span style="font-size:30px;color:${C.muted};font-weight:600">${num}</span>` : ""}
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:28px">
      ${icon ? `<div style="width:230px;height:230px;border-radius:56px;background:${C.forest};display:flex;align-items:center;justify-content:center;box-shadow:0 18px 50px rgba(0,0,0,.45)">
        <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</svg></div>` : ""}
      ${qr ? `<div style="background:#fff;border-radius:30px;padding:22px;box-shadow:0 0 0 6px ${C.door}"><div style="position:relative;width:260px;height:260px">${qr}<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${iconSvg(58)}</div></div></div>` : ""}
      <div class="am" style="font-size:${titleAm.length > 14 ? 78 : 96}px;font-weight:700;line-height:1.15;color:${C.door};text-shadow:0 5px 0 rgba(0,0,0,.4)">${titleAm}</div>
      <div style="font-size:46px;font-weight:700;line-height:1.2">${titleEn}</div>
      <div class="am" style="font-size:34px;line-height:1.5;color:${C.fg};max-width:880px">${bodyAm}</div>
      <div style="font-size:30px;line-height:1.45;color:${C.muted};max-width:880px">${bodyEn}</div>
      ${extra}
    </div>
    ${footer ? `<div style="display:flex;justify-content:space-between;align-items:center">
      ${logoRow(64, 44)}
      <span style="font-size:44px;font-weight:800;color:${C.door}">${URL_TEXT}</span>
    </div>` : "<div></div>"}
  </div>
</div>`);
}

const qrPost = await QRCode.toString("https://kiraybet.org/listings/new", { type: "svg", errorCorrectionLevel: "H", margin: 0, color: { dark: "#141311", light: "#ffffff" } });

const howTo = [
  { badge: "እንዴት ይሠራል? · How it works", titleAm: "ኪራይ ቤት እንዴት ይሠራል?", titleEn: "How KirayBet works", bodyAm: "በ4 ቀላል ደረጃዎች ቤት ያግኙ።", bodyEn: "Find your next home in 4 easy steps.", icon: "swipe", extra: `<div style="font-size:30px;color:${C.door};font-weight:700">ያንሸራትቱ · Swipe →</div>` },
  { titleAm: "1. ይፈልጉ", titleEn: "Search", bodyAm: "አካባቢዎን ይምረጡ፤ በዋጋ፣ በክፍል ብዛት፣ በቤት እንስሳና በመኪና ማቆሚያ ያጣሩ።", bodyEn: "Pick your area and filter by price, bedrooms, pets and parking.", icon: "search" },
  { titleAm: "2. መልዕክት ይላኩ", titleEn: "Message the host", bodyAm: "በኪራይ ቤት ውስጥ በግል ይነጋገሩ። ስልክ ቁጥር አያስፈልግም።", bodyEn: "Chat privately inside KirayBet. No phone number needed.", icon: "chat" },
  { titleAm: "3. ቤቱን ይዩ", titleEn: "See the home in person", bodyAm: "ዝግጁ ሲሆኑ ባለቤቱ ትክክለኛውን አድራሻ ያጋራል። ቤቱን በአካል ይጎብኙ።", bodyEn: "When you're ready, the host shares the exact address. Visit before you decide.", icon: "home" },
  { titleAm: "4. ይግቡ", titleEn: "Sign, then move in", bodyAm: "መጀመሪያ ውል ይፈርሙ፣ ከዚያ ይክፈሉ። ቤቱን ሳያዩ ገንዘብ በፍጹም አይላኩ።", bodyEn: "Sign a lease first, then pay. Never send money before seeing the home.", icon: "key" },
  { titleAm: "ቤት ያከራያሉ?", titleEn: "Have a place to rent out?", bodyAm: "ቤትዎን፣ ቤዝመንትዎን ወይም ክፍልዎን በጥቂት ደቂቃዎች በነጻ ይለጥፉ። እያንዳንዱን ማስታወቂያ ከመውጣቱ በፊት እንገመግማለን።", bodyEn: "Post your house, basement or room free in a few minutes. Every listing is reviewed before it goes live.", icon: "post" },
];

const tips = [
  { titleAm: "ቤቱን ሳያዩ ገንዘብ አይላኩ", titleEn: "Never pay before you see it", bodyAm: "ቤቱን በአካል ሳያዩና ውል ሳይፈርሙ ቅድመ ክፍያም ሆነ ኪራይ በZelle፣ በCash App ወይም በሌላ መንገድ አይላኩ።", bodyEn: "Don't send a deposit or rent by Zelle, Cash App or any other way until you've seen the home and signed a lease.", icon: "money" },
  { titleAm: "በጣም ርካሽ ከመሰለ ይጠንቀቁ", titleEn: "Too good to be true? Be careful", bodyAm: "ዋጋው ከአካባቢው በጣም ያነሰ ከሆነ፣ ወይም ባለቤቱ \"ከአገር ውጭ ነኝ\" ካለ፣ የማጭበርበር ምልክት ሊሆን ይችላል።", bodyEn: "A price far below the area, or a host who is \"out of the country\" and can't show the home, are common scam signs.", icon: "alert" },
  { titleAm: "ውይይቱን በኪራይ ቤት ያድርጉ", titleEn: "Keep the chat on KirayBet", bodyAm: "መልዕክቶችዎ በኪራይ ቤት ውስጥ ሲሆኑ ደህንነትዎ ይጠበቃል። የሚያጠራጥር ሰው ካለ ሪፖርት ያድርጉ።", bodyEn: "Your messages stay private on KirayBet, and anyone suspicious can be reported with one tap.", icon: "shield" },
];

// ---------- handout cards: 4 per US Letter page, light to save ink ----------
function handouts() {
  const one = `
  <div class="h">
    ${logoRow(54, 40, { light: true })}
    <div class="am" style="font-size:44px;font-weight:700;line-height:1.15;margin-top:8px"><span style="color:${C.forest}">ቤት ይፈልጋሉ?</span><br>ቤት ያከራያሉ?</div>
    <div style="font-size:19px;color:#5b554c">Homes, basements and rooms for rent from our community. Free · No phone number needed</div>
    <div style="display:flex;align-items:center;gap:22px">
      <div class="qrbox" style="position:relative;width:190px;height:190px;border:4px solid ${C.forest};border-radius:18px;padding:10px;box-sizing:content-box">${qrSvg}<div style="position:absolute;inset:10px;display:flex;align-items:center;justify-content:center">${iconSvg(42)}</div></div>
      <div style="text-align:left">
        <div style="font-size:42px;font-weight:800;color:${C.forest}">${URL_TEXT}</div>
        <div class="am" style="font-size:20px;color:#5b554c;margin-top:4px">ስካን ያድርጉ · Scan me</div>
        <div style="font-size:16px;color:#5b554c;margin-top:10px;line-height:1.5">IG @kiraybet.us<br>fb.com/kiraybetus<br>t.me/kiraybetus</div>
      </div>
    </div>
  </div>`;
  return base(1275, 1650, `<div class="grid">${one}${one}${one}${one}</div>`, `
    body{color:#1c1a17;background:#fff}
    .grid{width:1275px;height:1650px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
    .h{border:2px dashed #c9c2b6;margin:-1px;padding:40px 36px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center}
    .h .qrbox>svg{display:block;width:100%;height:100%}
    .h .qrx{}
  `, "#ffffff");
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


// ---------- Telegram intro post: website + channel, two QR codes ----------
const qrTg = await QRCode.toString("https://t.me/kiraybetus", { type: "svg", errorCorrectionLevel: "H", margin: 0, color: { dark: "#141311", light: "#ffffff" } });
const tgIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path d="M5.4 11.7 16.9 7.3c.5-.2 1 .1.8.9l-2 9.3c-.1.6-.6.8-1.2.5l-3.2-2.4-1.6 1.5c-.2.2-.4.3-.7.3l.2-3.3 6-5.4c.3-.2-.1-.4-.4-.2l-7.4 4.7-3.2-1c-.7-.2-.7-.7.2-1z" fill="#fff"/></svg>`;
function telegramPost() {
  const qrBox = (svg, ring, center) => `<div style="background:#fff;border-radius:26px;padding:18px;box-shadow:0 0 0 5px ${ring}"><div style="position:relative;width:250px;height:250px">${svg}<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:22%;padding:5px;display:flex">${center}</div></div></div></div>`;
  return base(1080, 1350, `
<div style="position:relative;width:1080px;height:1350px;overflow:hidden;background:${C.bg}">
  <div style="position:absolute;inset:-20% -20% auto -20%;height:62%;background:radial-gradient(ellipse at 50% 30%, rgba(83,129,89,.5), rgba(83,129,89,0) 65%)"></div>
  <div style="position:absolute;right:-180px;bottom:120px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle, rgba(42,171,238,.22), rgba(42,171,238,0) 70%)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:190px;-webkit-mask-image:linear-gradient(to top,#000 30%,transparent)">${skylineAll("#3a4d3f", 0.5)}</div>
  <div style="position:relative;height:100%;padding:56px 70px 44px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;justify-content:space-between;align-items:center">
      ${logoRow(76, 54)}
      <span style="background:${C.door};color:${C.bg};border-radius:999px;padding:10px 22px;font-size:26px;font-weight:800">አዲስ · NEW</span>
    </div>
    <div style="text-align:center">
      <div class="am" style="font-size:104px;font-weight:700;line-height:1.1;color:${C.door};text-shadow:0 5px 0 rgba(0,0,0,.4)">ቤት ይፈልጋሉ?</div>
      <div class="am" style="font-size:104px;font-weight:700;line-height:1.1;text-shadow:0 5px 0 rgba(0,0,0,.4)">ቤት ያከራያሉ?</div>
      <div class="am" style="margin-top:18px;font-size:36px;line-height:1.4">ከማህበረሰባችን የሚከራዩ ቤቶች፣ ቤዝመንቶችና ክፍሎች · <b style="color:${C.door}">ነጻ</b></div>
      <div style="margin-top:6px;font-size:28px;color:${C.muted}">Homes, basements and rooms for rent from our community · Free</div>
    </div>
    <div style="display:flex;gap:28px">
      <div style="flex:1;border:2px solid ${C.border};background:rgba(30,28,25,.9);border-radius:32px;padding:30px 24px;display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center">
        <div class="am" style="font-size:30px;font-weight:700">🏠 ቤት ይፈልጉ ወይም ይለጥፉ</div>
        <div style="font-size:22px;color:${C.muted};margin-top:-10px">Search or post a home</div>
        ${qrBox(qrSvg, C.door, iconSvg(50))}
        <div style="font-size:46px;font-weight:800;color:${C.door}">kiraybet.org</div>
      </div>
      <div style="flex:1;border:2px solid rgba(42,171,238,.55);background:rgba(18,33,44,.9);border-radius:32px;padding:30px 24px;display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center">
        <div class="am" style="font-size:30px;font-weight:700">📢 አዳዲስ ቤቶች በየሳምንቱ</div>
        <div style="font-size:22px;color:${C.muted};margin-top:-10px">New homes every week on Telegram</div>
        ${qrBox(qrTg, "#2AABEE", tgIcon(52))}
        <div style="font-size:42px;font-weight:800;color:#5ec4f5">t.me/kiraybetus</div>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:30px;font-size:25px;color:${C.fg};font-weight:600;white-space:nowrap">
      <span><b style="color:${C.door}">✓</b> <span class="am">ነጻ</span> · Free</span>
      <span><b style="color:${C.door}">✓</b> <span class="am">ስልክ ቁጥር አያስፈልግም</span></span>
      <span><b style="color:${C.door}">✓</b> <span class="am">አማርኛ</span> &amp; English</span>
    </div>
  </div>
</div>`);
}


// Website-only intro (for other people's groups: no channel link).
function websitePost() {
  return base(1080, 1350, `
<div style="position:relative;width:1080px;height:1350px;overflow:hidden;background:${C.bg}">
  <div style="position:absolute;inset:-20% -20% auto -20%;height:62%;background:radial-gradient(ellipse at 50% 30%, rgba(83,129,89,.5), rgba(83,129,89,0) 65%)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:190px;-webkit-mask-image:linear-gradient(to top,#000 30%,transparent)">${skylineAll("#3a4d3f", 0.5)}</div>
  <div style="position:relative;height:100%;padding:56px 70px 44px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;justify-content:space-between;align-items:center">
      ${logoRow(76, 54)}
      <span style="background:${C.door};color:${C.bg};border-radius:999px;padding:10px 22px;font-size:26px;font-weight:800">አዲስ · NEW</span>
    </div>
    <div style="text-align:center">
      <div class="am" style="font-size:104px;font-weight:700;line-height:1.1;color:${C.door};text-shadow:0 5px 0 rgba(0,0,0,.4)">ቤት ይፈልጋሉ?</div>
      <div class="am" style="font-size:104px;font-weight:700;line-height:1.1;text-shadow:0 5px 0 rgba(0,0,0,.4)">ቤት ያከራያሉ?</div>
      <div class="am" style="margin-top:18px;font-size:36px;line-height:1.4">ከማህበረሰባችን የሚከራዩ ቤቶች፣ ቤዝመንቶችና ክፍሎች · <b style="color:${C.door}">ነጻ</b></div>
      <div style="margin-top:6px;font-size:28px;color:${C.muted}">Homes, basements and rooms for rent from our community · Free</div>
    </div>
    <div style="border:2px solid ${C.border};background:rgba(30,28,25,.9);border-radius:36px;padding:34px 40px;display:flex;align-items:center;gap:40px">
      <div style="background:#fff;border-radius:28px;padding:20px;box-shadow:0 0 0 6px ${C.door};flex-shrink:0">
        <div style="position:relative;width:290px;height:290px">${qrSvg}<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:22%;padding:5px;display:flex">${iconSvg(58)}</div></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="am" style="font-size:32px;font-weight:700;white-space:nowrap">🏠 ይፈልጉ ወይም በነጻ ይለጥፉ</div>
        <div style="font-size:23px;color:${C.muted};margin-top:-10px">Search, or post your place for free</div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;font-size:26px">
          <li>${check("#fff")} <span class="am">ስልክ ቁጥር አያስፈልግም</span></li>
          <li>${check("#fff")} <span class="am">አድራሻ በባለቤቱ ፈቃድ ብቻ</span></li>
          <li>${check("#fff")} <span class="am">አማርኛ</span> &amp; English</li>
        </ul>
        <div style="font-size:58px;font-weight:800;color:${C.door};text-shadow:0 4px 0 rgba(0,0,0,.45)">kiraybet.org</div>
      </div>
    </div>
    <div style="text-align:center;font-size:22px;line-height:1.5;color:${C.muted}">Denver · DC · MD · VA · Seattle · Dallas · Austin · Houston<br>Minneapolis · Portland · Atlanta · Bay Area · Southern California</div>
  </div>
</div>`);
}

// ---------- render ----------
const jobs = [
  // [file, html, width, height, scale]
  ["print/poster-letter.png", poster(1398), 1080, 1398, 2550 / 1080],
  ["social/poster-chat-and-instagram-post-1080x1350.png", poster(1350), 1080, 1350, 1],
  ["social/story-1080x1920.png", poster(1920), 1080, 1920, 1],
  ["print/poster-letter-light.png", poster(1398, light), 1080, 1398, 2550 / 1080],
  ["print/handout-cards-4-per-page.png", handouts(), 1275, 1650, 2],
  ...howTo.map((c, i) => [`posts/how-it-works-${i + 1}.png`, card({ badge: c.badge ?? "እንዴት ይሠራል? · How it works", num: `${i + 1}/${howTo.length}`, ...c }), 1080, 1350, 1]),
  ...tips.map((c, i) => [`posts/safety-tip-${i + 1}.png`, card({ badge: "የደህንነት ምክር · Safety tip", ...c }), 1080, 1350, 1]),
  ["posts/telegram-intro-website-and-channel.png", telegramPost(), 1080, 1350, 1],
  ["posts/group-intro-website-only.png", websitePost(), 1080, 1350, 1],
  ["posts/for-hosts-post-your-home.png", card({ badge: "ለባለቤቶች · For hosts", titleAm: "ክፍል ወይም ቤዝመንት ያከራያሉ?", titleEn: "Renting out a room or basement?", bodyAm: "ከማህበረሰባችን ተከራዮችን በነጻ ያግኙ። ትክክለኛውን አድራሻ ማን እንደሚያይ እርስዎ ይወስናሉ።", bodyEn: "Reach renters from our community for free. You decide who sees your exact address. Scan to post your home.", qr: qrPost }), 1080, 1350, 1],
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
  if (file.startsWith("print/")) {
    // Print PDF: the 300-dpi poster image on one US Letter page, edge to edge.
    const img = readFileSync(path).toString("base64");
    const pdfPage = await browser.newPage();
    await pdfPage.setContent(`<style>@page{size:8.5in 11in;margin:0}html,body{margin:0}img{display:block;width:8.5in;height:11in}</style><img src="data:image/png;base64,${img}">`);
    await pdfPage.pdf({ path: path.replace(/\.png$/, ".pdf"), width: "8.5in", height: "11in", printBackground: true, pageRanges: "1" });
    await pdfPage.close();
  }
  await page.close();
  console.log("✓", file);
}
writeFileSync(join(OUT, "logos/icon.svg"), iconSvg(1024).trim() + "\n");
await browser.close();
