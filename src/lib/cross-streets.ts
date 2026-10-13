import "server-only";

// Finds the nearest major intersection to a point, e.g. "Havana & Iliff", using
// OpenStreetMap road data (the free Overpass API). Called with the blurred map point,
// never the exact address. Returns null if nothing is found or the service is busy;
// pages then show the neighborhood instead.

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Arterials first; widen to collector roads only if no arterial crossing is close.
const searches = [
  { radius: 1600, classes: "trunk|primary|secondary" },
  { radius: 3000, classes: "trunk|primary|secondary|tertiary" },
];

type OsmElement =
  | { type: "node"; id: number; lat: number; lon: number }
  | { type: "way"; id: number; nodes: number[]; tags?: { name?: string } };

// "East Iliff Avenue" -> "Iliff", "S Havana St" -> "Havana".
export function shortRoadName(name: string) {
  return name
    .trim()
    .replace(/^(North|South|East|West|N|S|E|W)\.?\s+/i, "")
    .replace(
      /\s+(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Parkway|Pkwy|Drive|Dr|Way|Lane|Ln|Place|Pl|Court|Ct|Circle|Cir|Highway|Hwy|Trail|Trl)\.?$/i,
      "",
    )
    .trim();
}

async function overpass(query: string): Promise<OsmElement[] | null> {
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({ data: query }),
        headers: { "User-Agent": "KirayBet (rental listings, Denver)" },
        signal: AbortSignal.timeout(25_000),
        cache: "no-store",
      });
      if (res.ok) return (await res.json()).elements as OsmElement[];
    } catch {
      // Busy or unreachable: try the next server.
    }
  }
  return null;
}

// Picks the nearest node shared by two differently named roads. Exported for tests.
export function nearestIntersection(elements: OsmElement[], lat: number, lng: number) {
  const nodes = new Map<number, { lat: number; lon: number }>();
  for (const e of elements) if (e.type === "node") nodes.set(e.id, e);

  const namesAt = new Map<number, Set<string>>();
  // How much each road runs north-south vs east-west, to order the pair like
  // people say it ("Havana & Iliff": the north-south street first).
  const direction = new Map<string, { ns: number; ew: number }>();
  const lngScale = Math.cos((lat * Math.PI) / 180);

  for (const e of elements) {
    if (e.type !== "way" || !e.tags?.name) continue;
    const name = shortRoadName(e.tags.name);
    if (!name) continue;
    const dir = direction.get(name) ?? { ns: 0, ew: 0 };
    for (let i = 0; i < e.nodes.length; i++) {
      const id = e.nodes[i];
      namesAt.set(id, (namesAt.get(id) ?? new Set()).add(name));
      const a = nodes.get(id);
      const b = nodes.get(e.nodes[i + 1]);
      if (a && b) {
        dir.ns += Math.abs(b.lat - a.lat);
        dir.ew += Math.abs(b.lon - a.lon) * lngScale;
      }
    }
    direction.set(name, dir);
  }

  let best: { distance: number; names: string[] } | null = null;
  for (const [id, names] of namesAt) {
    const point = nodes.get(id);
    if (names.size < 2 || !point) continue;
    const distance = Math.hypot((point.lat - lat) * 111_000, (point.lon - lng) * 111_000 * lngScale);
    if (!best || distance < best.distance) best = { distance, names: [...names] };
  }
  if (!best) return null;

  const isNorthSouth = (name: string) => {
    const d = direction.get(name);
    return d ? d.ns > d.ew : false;
  };
  const [first, second] = best.names
    .slice(0, 2)
    .sort((a, b) => Number(isNorthSouth(b)) - Number(isNorthSouth(a)) || a.localeCompare(b));
  return `${first} & ${second}`.slice(0, 80);
}

export async function findCrossStreets(lat: number, lng: number): Promise<string | null> {
  for (const { radius, classes } of searches) {
    const elements = await overpass(
      `[out:json][timeout:20];way(around:${radius},${lat},${lng})[highway~"^(${classes})$"][name];out body;>;out skel qt;`,
    );
    if (!elements) return null;
    const found = nearestIntersection(elements, lat, lng);
    if (found) return found;
  }
  return null;
}
