import { formatDate } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";

type Day = { day: string; visitors: number; page_views: number; signups: number; listings: number };
type Metric = { key: keyof Omit<Day, "day">; label: string; note: string };

const metrics: Metric[] = [
  { key: "visitors", label: "Visits", note: "unique visitors per day, added up" },
  { key: "page_views", label: "Page views", note: "pages opened" },
  { key: "signups", label: "Sign-ups", note: "new accounts" },
  { key: "listings", label: "New listings", note: "listings posted" },
];

function sum(days: Day[], key: Metric["key"]) {
  return days.reduce((total, d) => total + d[key], 0);
}

// Change vs the previous 7 days: "▲ 25%", "▼ 10%", "new", or "no change".
function change(current: number, previous: number) {
  if (current === previous) return { text: "no change", tone: "text-muted" };
  if (previous === 0) return { text: "▲ new", tone: "text-brand" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct > 0 ? { text: `▲ ${pct}%`, tone: "text-brand" } : { text: `▼ ${Math.abs(pct)}%`, tone: "text-danger" };
}

// 14 thin bars: the earlier week in gray, this week in the brand green. Each bar has a
// hover tooltip (title) with the date and value.
function Trend({ days, metric }: { days: Day[]; metric: Metric }) {
  const max = Math.max(1, ...days.map((d) => d[metric.key]));
  const barWidth = 8;
  const gap = 2;
  const height = 32;
  return (
    <svg
      viewBox={`0 0 ${days.length * (barWidth + gap)} ${height}`}
      className="mt-3 h-8 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${metric.label}, last ${days.length} days`}
    >
      {days.map((d, i) => {
        const value = d[metric.key];
        const h = value === 0 ? 1 : Math.max(2, (value / max) * height);
        const thisWeek = i >= days.length - 7;
        return (
          <rect
            key={d.day}
            x={i * (barWidth + gap)}
            y={height - h}
            width={barWidth}
            height={h}
            rx={value === 0 ? 0 : 1.5}
            className={thisWeek ? "fill-brand" : "fill-[#5a544b]"}
          >
            <title>{`${formatDate(d.day)}: ${value.toLocaleString("en-US")}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export async function ActivityStats() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("admin_daily_stats", { days: 14 });
  if (error || !data) return <p className="text-sm text-danger">Couldn&apos;t load activity stats.</p>;

  const days = data as Day[];
  const thisWeek = days.slice(-7);
  const lastWeek = days.slice(0, -7);
  const today = days[days.length - 1];

  return (
    <section aria-labelledby="activity-heading" className="space-y-3">
      <h2 id="activity-heading" className="text-lg font-bold">
        Last 7 days <span className="text-sm font-normal text-muted">vs the 7 days before</span>
      </h2>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => {
          const current = sum(thisWeek, metric.key);
          const delta = change(current, sum(lastWeek, metric.key));
          return (
            <div key={metric.key} className="rounded-2xl border border-border bg-surface p-4">
              <dt className="text-xs text-muted" title={metric.note}>
                {metric.label}
              </dt>
              <dd className="text-2xl font-semibold">{current.toLocaleString("en-US")}</dd>
              <dd className="text-xs">
                <span className={`font-semibold ${delta.tone}`}>{delta.text}</span>
                <span className="text-muted"> · today {today[metric.key].toLocaleString("en-US")}</span>
              </dd>
              <dd>
                <Trend days={days} metric={metric} />
              </dd>
            </div>
          );
        })}
      </dl>
      <details className="text-sm">
        <summary className="cursor-pointer py-2 text-muted hover:text-foreground">Show daily numbers</summary>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[420px] text-left">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="p-2 pl-3">Day</th>
                {metrics.map((m) => (
                  <th key={m.key} className="p-2 text-right">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[...days].reverse().map((d) => (
                <tr key={d.day} className="border-b border-border last:border-0">
                  <td className="p-2 pl-3">{formatDate(d.day, { weekday: "short", month: "short", day: "numeric" })}</td>
                  {metrics.map((m) => (
                    <td key={m.key} className="p-2 text-right">
                      {d[m.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Visits are counted with an anonymous cookie (no IP addresses, no third parties), and not
          for visitors whose browser asks not to be tracked, so real traffic is a bit higher.
        </p>
      </details>
    </section>
  );
}
