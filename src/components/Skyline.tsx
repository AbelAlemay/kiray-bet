import type { ReactNode } from "react";
import type { RegionId } from "@/lib/regions";

// A quiet skyline silhouette for each area along the bottom of the home page banner.
// Drawn on a 1440×220 canvas, ground at y=220. Phones show only the middle
// (about x 450–1000), so each area's landmarks sit there.

const G = 220;

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
  return <g opacity={0.7}>{out}</g>;
}

const box = (x: number, w: number, h: number) => <rect x={x} y={G - h} width={w} height={h} />;
const spire = (cx: number, from: number, to: number) => <rect x={cx - 1} y={G - to} width={2} height={to - from} />;
const far = (d: string) => <path d={d} opacity={0.45} />;

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
      {far("M0 150 L80 112 L150 135 L230 72 L300 120 L360 96 L430 130 L520 62 L600 116 L680 92 L760 126 L850 56 L930 110 L1010 86 L1090 122 L1180 66 L1260 112 L1340 92 L1440 130 V220 H0Z")}
      {blocks(380, 1090, 28, 90, 11)}
      {box(600, 34, 125)}
      {/* Wells Fargo Center, "the cash register" */}
      <path d={`M640 ${G} V${G - 130} Q640 ${G - 160} 665 ${G - 160} Q690 ${G - 160} 690 ${G - 130} V${G}Z`} />
      {box(700, 46, 172)}
      <path d={`M756 ${G} V${G - 150} L796 ${G - 166} V${G}Z`} />
      {box(806, 36, 112)}
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
    </>
  ),
  houston: (
    <>
      {blocks(380, 1100, 50, 140, 17)}
      {/* JPMorgan Chase Tower */}
      <path d={`M636 ${G} V${G - 192} L642 ${G - 200} H684 V${G}Z`} />
      <rect x={694} y={G - 188} width={44} height={188} rx={6} />
      {/* Bank of America Center */}
      {box(748, 50, 150)}
      <path d={`M748 ${G - 150} L758 ${G - 166} L768 ${G - 150} L773 ${G - 174} L778 ${G - 150} L788 ${G - 166} L798 ${G - 150}Z`} />
      {/* Williams Tower */}
      {box(920, 34, 176)}
      {spire(937, 176, 196)}
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
    </>
  ),
  atlanta: (
    <>
      {blocks(440, 1060, 30, 110, 29)}
      {/* 191 Peachtree */}
      {box(600, 44, 150)}
      <path d={`M600 ${G - 150} L611 ${G - 166} L622 ${G - 150} L633 ${G - 166} L644 ${G - 150}Z`} />
      {/* Bank of America Plaza */}
      {box(660, 46, 150)}
      <path d={`M660 ${G - 150} L683 ${G - 182} L706 ${G - 150}Z`} />
      {spire(683, 182, 206)}
      {/* Westin Peachtree Plaza */}
      <rect x={720} y={G - 142} width={36} height={142} rx={14} />
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
      className="skyline pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-black opacity-50 sm:h-48"
      fill="currentColor"
    >
      {skylines[region]}
    </svg>
  );
}
