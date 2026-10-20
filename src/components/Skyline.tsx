import type { ReactNode } from "react";
import type { RegionId } from "@/lib/regions";

// A quiet skyline silhouette for each area along the bottom of the home page banner.
// Drawn on a 1440×220 canvas, ground at y=220. Phones show only the middle
// (about x 450–1000), so each area's landmarks sit there.

const G = 220;

// Solid colors (not see-through) so the banner's pattern doesn't show inside the buildings.
// Front to back: landmarks, plain buildings, foothills, far mountains.
const NEAR = "#223b2b";
const MID = "#2b4c37";
const HILL = "#30543d";
const FAR = "#375e45";

// Plain buildings between the landmarks. Seeded, so every visit draws the same city.
function blocks(from: number, to: number, low: number, high: number, seed: number) {
  let n = seed;
  const next = () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
  const out: ReactNode[] = [];
  for (let x = from; x < to; ) {
    const w = 16 + Math.round(next() * 22);
    const h = low + Math.round(next() * (high - low));
    out.push(<rect key={x} x={x} y={G - h} width={Math.min(w, to - x)} height={h} />);
    x += w + 2;
  }
  return <g fill={MID}>{out}</g>;
}

const box = (x: number, w: number, h: number) => <rect x={x} y={G - h} width={w} height={h} />;
const spire = (cx: number, from: number, to: number) => <rect x={cx - 1} y={G - to} width={2} height={to - from} />;
const far = (d: string) => <path d={d} fill={FAR} />;
const hills = (d: string) => <path d={d} fill={HILL} />;

// A dome on a drum: the Capitol in DC, Austin and Saint Paul.
function dome(cx: number, w: number, drum: number, rise: number) {
  const top = drum + rise;
  return (
    <>
      {box(cx - w / 2, w, drum)}
      <path d={`M${cx - w / 2} ${G - drum} Q${cx - w / 2} ${G - top} ${cx} ${G - top} Q${cx + w / 2} ${G - top} ${cx + w / 2} ${G - drum}Z`} />
      {box(cx - 4, 8, top + 12)}
      {spire(cx, top + 12, top + 22)}
    </>
  );
}

function palm(x: number, h: number) {
  const top = G - h;
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <path d={`M${x} ${G} Q${x + 8} ${G - h / 2} ${x + 3} ${top}`} strokeWidth={3} />
      <path
        d={`M${x + 3} ${top} q-14 -2 -24 10 M${x + 3} ${top} q14 -2 24 10 M${x + 3} ${top} q-8 -10 -20 -8 M${x + 3} ${top} q8 -10 20 -8 M${x + 3} ${top} q0 -8 2 -14`}
        strokeWidth={2.5}
      />
    </g>
  );
}

const skylines: Record<RegionId, ReactNode> = {
  denver: (
    <>
      {/* The Front Range behind the city, foothills in front of it */}
      {far("M0 120 L40 104 L72 116 L118 70 L150 92 L186 60 L214 78 L250 52 L290 84 L330 66 L372 96 L420 74 L470 104 L520 88 L580 112 L650 94 L720 118 L790 96 L860 116 L930 84 L990 104 L1040 68 L1068 80 L1096 56 L1128 56 L1150 76 L1196 62 L1240 92 L1290 74 L1340 98 L1390 82 L1440 100 V220 H0Z")}
      {hills("M0 170 Q60 140 130 156 T270 150 T420 162 T600 158 T800 166 T1000 156 T1200 162 T1440 150 V220 H0Z")}
      {/* Empower Field at Mile High */}
      <path d={`M150 ${G} V${G - 34} Q196 ${G - 62} 240 ${G - 50} Q286 ${G - 62} 332 ${G - 34} V${G}Z`} />
      {blocks(470, 980, 18, 64, 11)}
      {/* Daniels & Fisher clock tower */}
      {box(522, 16, 108)}
      <path d={`M520 ${G - 108} L530 ${G - 126} L540 ${G - 108}Z`} />
      {spire(530, 126, 136)}
      {/* Four Seasons */}
      {box(566, 30, 136)}
      <path d={`M566 ${G - 136} H572 V${G - 146} L581 ${G - 158} L590 ${G - 146} V${G - 136} H596 V${G - 130} H566Z`} />
      {/* Republic Plaza, the tallest */}
      <path d={`M606 ${G} V${G - 176} H610 V${G - 182} H646 V${G - 176} H650 V${G}Z`} />
      {/* Wells Fargo Center, "the cash register" */}
      <path d={`M662 ${G} V${G - 140} Q662 ${G - 170} 690 ${G - 172} Q718 ${G - 170} 718 ${G - 140} V${G}Z`} />
      {/* 1801 California, with its sloped top */}
      <path d={`M728 ${G} V${G - 156} L752 ${G - 174} L774 ${G - 160} V${G}Z`} />
      {box(784, 40, 124)}
      {/* Colorado State Capitol, the gold dome */}
      {box(836, 92, 30)}
      {dome(882, 40, 58, 34)}
      {/* Denver International Airport's tent roof */}
      <path
        d={`M1120 ${G} V${G - 22} L1138 ${G - 50} L1156 ${G - 26} L1174 ${G - 56} L1192 ${G - 28} L1210 ${G - 60} L1228 ${G - 28} L1246 ${G - 56} L1264 ${G - 26} L1282 ${G - 50} L1300 ${G - 22} V${G}Z`}
      />
      {[1138, 1174, 1210, 1246, 1282].map((x) => (
        <rect key={x} x={x - 1} y={G - (x === 1210 ? 70 : x === 1174 || x === 1246 ? 66 : 60)} width={2} height={14} />
      ))}
    </>
  ),
  dmv: (
    <>
      {blocks(300, 1140, 22, 52, 7)}
      {/* Washington Monument */}
      <path d={`M551 ${G} L554 ${G - 180} L560 ${G - 194} L566 ${G - 180} L569 ${G}Z`} />
      {/* The Capitol */}
      {box(720, 280, 40)}
      {box(812, 96, 62)}
      {dome(860, 58, 84, 46)}
      {/* Lincoln Memorial */}
      {box(170, 150, 10)}
      {box(180, 130, 14)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={188 + i * 15} y={G - 50} width={7} height={36} />
      ))}
      <rect x={182} y={G - 60} width={126} height={10} />
      <rect x={186} y={G - 66} width={118} height={6} />
      {/* Washington National Cathedral */}
      {box(1120, 160, 46)}
      {box(1180, 40, 104)}
      {spire(1188, 104, 118)}
      {spire(1212, 104, 118)}
      {box(1130, 22, 70)}
      {box(1258, 22, 70)}
    </>
  ),
  seattle: (
    <>
      {far("M760 220 L960 96 Q1010 62 1060 88 L1300 220Z")}
      {blocks(600, 1010, 30, 110, 3)}
      {/* Space Needle */}
      <path d={`M544 ${G} L557 ${G - 128} L563 ${G - 128} L576 ${G}Z`} />
      <path d={`M534 ${G - 128} L586 ${G - 128} L594 ${G - 138} L582 ${G - 152} L538 ${G - 152} L526 ${G - 138}Z`} />
      {box(554, 12, 162)}
      {spire(560, 162, 200)}
      {/* Columbia Center */}
      {box(700, 44, 176)}
      {box(708, 28, 188)}
      {box(760, 38, 140)}
      {/* The Olympic Mountains across the water */}
      {far("M0 170 L40 140 L70 152 L110 120 L140 136 L180 108 L220 132 L260 116 L300 140 L340 128 L400 160 L420 220 H0Z")}
      {/* Seattle Great Wheel */}
      <g fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx={410} cy={G - 54} r={42} />
        <path d={`M410 ${G - 96} V${G - 12} M368 ${G - 54} H452 M380 ${G - 84} L440 ${G - 24} M440 ${G - 84} L380 ${G - 24}`} strokeWidth={1.2} />
      </g>
      <path d={`M396 ${G} L410 ${G - 54} L424 ${G}Z`} />
    </>
  ),
  dfw: (
    <>
      {blocks(440, 1050, 36, 110, 5)}
      {/* Reunion Tower */}
      {box(555, 10, 150)}
      <circle cx={560} cy={G - 162} r={18} />
      {spire(560, 178, 190)}
      {box(624, 38, 150)}
      {spire(634, 150, 172)}
      {spire(652, 150, 166)}
      {box(680, 48, 186)}
      {/* Fountain Place */}
      <path d={`M748 ${G} V${G - 120} L780 ${G - 178} L792 ${G - 150} V${G}Z`} />
      {/* Margaret Hunt Hill Bridge */}
      <rect x={120} y={G - 30} width={300} height={4} />
      <path d={`M250 ${G - 28} Q270 ${G - 130} 290 ${G - 28}`} fill="none" stroke="currentColor" strokeWidth={5} />
      <path d={`M270 ${G - 110} L150 ${G - 30} M270 ${G - 110} L390 ${G - 30} M270 ${G - 90} L190 ${G - 30} M270 ${G - 90} L350 ${G - 30}`} fill="none" stroke="currentColor" strokeWidth={1.2} />
      {/* AT&T Stadium */}
      <path d={`M1110 ${G} V${G - 30} Q1220 ${G - 76} 1330 ${G - 30} V${G}Z`} />
    </>
  ),
  austin: (
    <>
      {blocks(440, 1020, 30, 100, 13)}
      {/* Texas Capitol */}
      {box(470, 180, 36)}
      {dome(560, 50, 72, 52)}
      {/* Frost Bank Tower */}
      {box(700, 40, 140)}
      <path d={`M700 ${G - 140} L708 ${G - 158} L714 ${G - 158} L720 ${G - 182} L726 ${G - 158} L732 ${G - 158} L740 ${G - 140}Z`} />
      {spire(720, 182, 204)}
      {/* The Independent, "the Jenga tower" */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={790 + (i % 2 ? 6 : i % 3 ? -4 : 0)} y={G - 22 * (i + 1)} width={38} height={22} />
      ))}
      {/* Hill Country and the Pennybacker Bridge */}
      {far("M0 170 Q90 140 180 158 T360 150 T440 166 V220 H0Z")}
      <rect x={90} y={G - 34} width={280} height={4} />
      <path d={`M150 ${G - 32} Q230 ${G - 104} 310 ${G - 32}`} fill="none" stroke="currentColor" strokeWidth={5} />
      {/* Hangers from the arch down to the road */}
      {[170, 190, 210, 230, 250, 270, 290].map((x) => {
        const h = Math.round(36 * (1 - ((x - 230) / 80) ** 2));
        return <rect key={x} x={x} y={G - 32 - h} width={1.5} height={h} />;
      })}
      {/* UT Tower */}
      {box(1160, 70, 28)}
      {box(1182, 26, 128)}
      {box(1178, 34, 112)}
      <path d={`M1182 ${G - 128} L1195 ${G - 140} L1208 ${G - 128}Z`} />
    </>
  ),
  houston: (
    <>
      {/* NRG Stadium and the Astrodome */}
      <path d={`M120 ${G} V${G - 38} Q200 ${G - 64} 280 ${G - 38} V${G}Z`} />
      <path d={`M296 ${G} V${G - 18} Q340 ${G - 52} 384 ${G - 18} V${G}Z`} />
      {blocks(420, 1010, 34, 110, 17)}
      {/* JPMorgan Chase Tower, the tallest */}
      <path d={`M636 ${G} V${G - 192} L642 ${G - 200} H684 V${G}Z`} />
      {/* Wells Fargo Plaza, rounded glass */}
      <rect x={694} y={G - 188} width={44} height={188} rx={6} />
      {/* Bank of America Center, stepped Dutch gables */}
      {box(748, 50, 150)}
      <path d={`M748 ${G - 150} L758 ${G - 166} L768 ${G - 150} L773 ${G - 174} L778 ${G - 150} L788 ${G - 166} L798 ${G - 150}Z`} />
      {/* Heritage Plaza, the Maya-temple top */}
      {box(810, 44, 140)}
      <path d={`M810 ${G - 140} H854 V${G - 146} H848 V${G - 152} H842 V${G - 158} H822 V${G - 152} H816 V${G - 146} H810Z`} />
      {/* Williams Tower */}
      {box(920, 34, 176)}
      {spire(937, 176, 196)}
      {/* San Jacinto Monument, with its star */}
      <path d={`M1180 ${G} L1188 ${G - 150} H1200 L1208 ${G} Z`} />
      {box(1166, 56, 14)}
      <path d={`M1194 ${G - 170} l3.5 7.2 7.9 1.1 -5.7 5.6 1.3 7.9 -7 -3.7 -7 3.7 1.3 -7.9 -5.7 -5.6 7.9 -1.1z`} />
    </>
  ),
  msp: (
    <>
      {blocks(420, 1060, 30, 110, 19)}
      {/* Foshay Tower */}
      <path d={`M588 ${G} L591 ${G - 120} L596 ${G - 128} L604 ${G - 128} L609 ${G - 120} L612 ${G}Z`} />
      {spire(600, 128, 146)}
      {/* IDS Center */}
      <path d={`M640 ${G} V${G - 170} H644 V${G - 177} H648 V${G - 185} H682 V${G - 177} H686 V${G - 170} H690 V${G}Z`} />
      {/* Wells Fargo Center */}
      {box(710, 44, 150)}
      {box(716, 32, 160)}
      {box(722, 20, 170)}
      <path d={`M774 ${G} V${G - 150} Q774 ${G - 170} 794 ${G - 170} Q814 ${G - 170} 814 ${G - 150} V${G}Z`} />
      {/* Cathedral of Saint Paul */}
      {box(950, 70, 40)}
      {dome(985, 40, 66, 34)}
      {/* Stone Arch Bridge */}
      <path d={`M100 ${G} V${G - 40} H400 V${G} ${[0, 1, 2, 3, 4, 5].map((i) => `H${380 - i * 50} Q${360 - i * 50} ${G - 26} ${340 - i * 50} ${G}`).join(" ")} Z`} />
      {/* U.S. Bank Stadium, the sharp prow */}
      <path d={`M1100 ${G} V${G - 40} L1150 ${G - 52} L1300 ${G - 88} L1340 ${G - 40} V${G}Z`} />
    </>
  ),
  portland: (
    <>
      {far("M780 220 L1000 72 L1030 82 L1260 220Z")}
      {blocks(570, 940, 30, 100, 23)}
      {/* Fremont Bridge */}
      <rect x={380} y={G - 32} width={180} height={4} />
      <path d={`M380 ${G - 30} Q470 ${G - 112} 560 ${G - 30}`} fill="none" stroke="currentColor" strokeWidth={5} />
      {box(640, 42, 150)}
      {/* "Big Pink" */}
      <rect x={700} y={G - 162} width={46} height={162} rx={8} />
      {far("M0 160 Q80 132 170 146 T340 144 T380 160 V220 H0Z")}
    </>
  ),
  atlanta: (
    <>
      {/* Stone Mountain on the horizon */}
      {far("M1040 220 Q1080 128 1200 118 Q1320 116 1380 170 L1440 200 V220Z")}
      {/* Mercedes-Benz Stadium, the pinwheel roof */}
      <path d={`M140 ${G} V${G - 40} L178 ${G - 70} L214 ${G - 46} L250 ${G - 78} L288 ${G - 50} L322 ${G - 72} L350 ${G - 40} V${G}Z`} />
      {blocks(440, 1000, 30, 104, 29)}
      {/* 191 Peachtree, the twin crowns */}
      {box(600, 44, 150)}
      <path d={`M600 ${G - 150} L611 ${G - 166} L622 ${G - 150} L633 ${G - 166} L644 ${G - 150}Z`} />
      {/* Bank of America Plaza, the gold pyramid and spire */}
      {box(660, 46, 150)}
      <path d={`M660 ${G - 150} L683 ${G - 182} L706 ${G - 150}Z`} />
      {spire(683, 182, 206)}
      {/* Westin Peachtree Plaza, the glass cylinder */}
      <rect x={720} y={G - 142} width={36} height={142} rx={14} />
      {/* Georgia State Capitol, the gold dome */}
      {box(770, 96, 30)}
      {dome(818, 38, 56, 32)}
      {/* One Atlantic Center */}
      {box(900, 40, 150)}
      <path d={`M900 ${G - 150} L920 ${G - 176} L940 ${G - 150}Z`} />
      {spire(920, 176, 190)}
    </>
  ),
  bayarea: (
    <>
      {far("M0 170 Q180 120 360 160 T720 150 T1080 140 T1440 160 V220 H0Z")}
      {blocks(660, 1060, 36, 120, 31)}
      {/* Golden Gate Bridge */}
      <rect x={320} y={G - 42} width={330} height={5} />
      {box(420, 10, 150)}
      {box(560, 10, 150)}
      <path
        d={`M320 ${G - 46} Q380 ${G - 80} 425 ${G - 150} Q495 ${G - 40} 565 ${G - 150} Q610 ${G - 80} 650 ${G - 46}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />
      {/* Transamerica Pyramid */}
      <path d={`M744 ${G} L760 ${G - 186} L776 ${G}Z`} />
      {spire(760, 186, 204)}
      {/* Salesforce Tower */}
      <path d={`M820 ${G} V${G - 176} Q820 ${G - 196} 840 ${G - 198} Q860 ${G - 196} 860 ${G - 176} V${G}Z`} />
    </>
  ),
  socal: (
    <>
      {far("M0 160 Q200 100 420 150 T860 130 T1440 150 V220 H0Z")}
      {blocks(620, 900, 30, 100, 37)}
      {palm(500, 120)}
      {palm(560, 96)}
      {/* U.S. Bank Tower */}
      <rect x={680} y={G - 176} width={44} height={176} rx={10} />
      <rect x={688} y={G - 186} width={28} height={12} rx={4} />
      {/* Wilshire Grand */}
      <path d={`M744 ${G} V${G - 168} L786 ${G - 188} L784 ${G - 204} L790 ${G - 186} V${G}Z`} />
      {palm(960, 110)}
      {palm(1010, 130)}
      {/* Griffith Observatory */}
      {box(210, 90, 18)}
      {box(236, 38, 34)}
      <path d={`M236 ${G - 34} Q255 ${G - 62} 274 ${G - 34}Z`} />
      <path d={`M210 ${G - 18} Q218 ${G - 34} 226 ${G - 18}Z M284 ${G - 18} Q292 ${G - 34} 300 ${G - 18}Z`} />
      {/* The Hollywood sign */}
      <text x={1130} y={G - 74} fontSize={30} fontWeight={800} fontFamily="Arial, sans-serif" letterSpacing={3} transform={`rotate(-4 1130 ${G - 74})`}>
        HOLLYWOOD
      </text>
    </>
  ),
};

export function Skyline({ region }: { region: RegionId }) {
  return (
    <svg
      key={region}
      aria-hidden
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax slice"
      className="skyline pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full sm:h-48"
      fill={NEAR}
      color={NEAR}
    >
      {skylines[region]}
    </svg>
  );
}
