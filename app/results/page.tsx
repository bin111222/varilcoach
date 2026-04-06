"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./results.css";

type ResultPR = { label: string; current: string; target: string; unit?: string };

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)",
  push: "var(--push)",
  run: "var(--run)",
  swim: "var(--swim)",
  mma: "var(--mma)",
  rest: "var(--rest)",
  legs: "var(--legs)",
  other: "var(--muted)",
};

async function fetchJsonWithTimeout(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function toNumeric(v: string | number) {
  if (typeof v === "number") return v;
  const m = String(v ?? "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function toMinutes(v: string) {
  const s = String(v ?? "");
  const mmss = s.match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (mmss) return Number(mmss[1]) + Number(mmss[2]) / 60;
  return toNumeric(s);
}

function parseLogDate(d: unknown): Date | null {
  if (!d) return null;
  const t = new Date(d as string | number | Date).getTime();
  return Number.isFinite(t) ? new Date(t) : null;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ResultsPage() {
  const [progress, setProgress] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJsonWithTimeout("/api/progress"), fetchJsonWithTimeout("/api/settings")])
      .then(([p, s]) => {
        setProgress(Array.isArray(p) ? p : []);
        setSettings(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const analysis = useMemo(() => {
    const logs = [...progress].sort((a, b) => {
      const da = parseLogDate(a.date)?.getTime() ?? 0;
      const db = parseLogDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
    const n = logs.length;
    const now = new Date();

    // Stats
    let totalSets = 0;
    let rpeSum = 0;
    let rpeN = 0;
    const rpeCounts = [0, 0, 0, 0, 0]; // (<=5, 6, 7, 8, >=9)
    const exerciseBests = new Map<string, number>();

    for (const log of logs) {
      for (const ex of log.exercises ?? []) {
        const name = String(ex.exerciseName ?? "").trim().toLowerCase();
        const sets = ex.sets ?? [];
        totalSets += sets.length;
        for (const st of sets) {
          // Weight bests
          const weight = toNumeric(st.weight);
          if (weight > 0) {
            const currentBest = exerciseBests.get(name) ?? 0;
            if (weight > currentBest) exerciseBests.set(name, weight);
          }
          // RPE counts
          if (typeof st.rpe === "number" && st.rpe > 0) {
            rpeSum += st.rpe;
            rpeN += 1;
            if (st.rpe <= 5) rpeCounts[0]++;
            else if (st.rpe === 6) rpeCounts[1]++;
            else if (st.rpe === 7) rpeCounts[2]++;
            else if (st.rpe === 8) rpeCounts[3]++;
            else rpeCounts[4]++;
          }
        }
      }
    }
    const avgRpe = rpeN ? rpeSum / rpeN : null;

    const weekSet = new Set<number>();
    for (const log of logs) weekSet.add(Number(log.weekNumber ?? 0));
    const weeksActive = weekSet.size;
    const sessionsPerWeek = weeksActive ? n / weeksActive : 0;
    const targetFreq = Number(settings?.programConfig?.targetSessionsPerWeek ?? 4);
    const consistencyPct = targetFreq ? Math.min(100, Math.round((sessionsPerWeek / targetFreq) * 100)) : 0;

    const lastLog = logs.length ? logs[logs.length - 1] : null;
    const lastDate = lastLog ? parseLogDate(lastLog.date) : null;
    const daysSince = lastDate ? Math.max(0, daysBetween(lastDate, now)) : null;

    const ms7 = 7 * 24 * 60 * 60 * 1000;
    const recent7 = logs.filter((l) => {
      const d = parseLogDate(l.date);
      return d && now.getTime() - d.getTime() <= ms7;
    }).length;

    const avgIn = n ? logs.reduce((s, r) => s + Number(r.energyIn ?? 0), 0) / n : 0;
    const avgOut = n ? logs.reduce((s, r) => s + Number(r.energyOut ?? 0), 0) / n : 0;
    const balance = avgIn - avgOut;

    const grouped = new Map<number, { inSum: number; outSum: number; n: number; sessions: number }>();
    for (const row of logs) {
      const k = Number(row.weekNumber ?? 0);
      const g = grouped.get(k) ?? { inSum: 0, outSum: 0, n: 0, sessions: 0 };
      g.inSum += Number(row.energyIn ?? 0);
      g.outSum += Number(row.energyOut ?? 0);
      g.n += 1;
      g.sessions += 1;
      grouped.set(k, g);
    }
    const weeklySeries = [...grouped.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(-10)
      .map(([week, g]) => ({
        week,
        energyIn: g.n ? g.inSum / g.n : 0,
        energyOut: g.n ? g.outSum / g.n : 0,
        sessions: g.sessions,
      }));

    let energyInDeltaPct: number | null = null;
    if (weeklySeries.length >= 4) {
      const mid = Math.floor(weeklySeries.length / 2);
      const first = weeklySeries.slice(0, mid);
      const second = weeklySeries.slice(mid);
      const a1 = first.reduce((s, r) => s + r.energyIn, 0) / first.length;
      const a2 = second.reduce((s, r) => s + r.energyIn, 0) / second.length;
      if (a1 > 0.01) energyInDeltaPct = ((a2 - a1) / a1) * 100;
    }

    const typeCounts: Record<string, number> = {};
    for (const p of logs) {
      const t = String(p.sessionType ?? "other");
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const topType = sortedTypes[0]?.[0] ?? null;
    const topTypePct = topType && n ? Math.round((typeCounts[topType] / n) * 100) : 0;

    const insights: string[] = [];
    if (n === 0) {
      insights.push("No sessions logged yet — your charts and trends will appear here once you start logging.");
    } else {
      if (daysSince !== null && daysSince <= 2) {
        insights.push(`Last session ${daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`} — momentum looks fresh.`);
      } else if (daysSince !== null && daysSince > 7) {
        insights.push(`It's been ${daysSince} days since your last log — consider a light session or deload check-in when you're ready.`);
      }
      if (energyInDeltaPct !== null && Math.abs(energyInDeltaPct) >= 3) {
        insights.push(
          energyInDeltaPct > 0
            ? `Average energy-in is up about ${Math.abs(Math.round(energyInDeltaPct))}% in more recent weeks vs earlier in this window — you're trending more fuelled for training.`
            : `Average energy-in dipped about ${Math.abs(Math.round(energyInDeltaPct))}% in more recent weeks — worth checking sleep, stress, and nutrition.`
        );
      }
      if (topType && n >= 3) {
        insights.push(
          `${topTypePct}% of sessions are ${topType} — that's your current emphasis; balance with complementary work if recovery flags.`
        );
      }
      if (avgRpe !== null && rpeN >= 5) {
        insights.push(
          `Logged RPE averages ${avgRpe.toFixed(1)} across ${rpeN} sets — ${
            avgRpe >= 8.5 ? "you're often near limit — watch fatigue accumulation." : avgRpe <= 6.5 ? "plenty of room to push loads where form stays crisp." : "a sustainable intensity spread for steady progress."
          }`
        );
      }
      if (balance < -0.8 && n >= 4) {
        insights.push("Energy-out is running higher than energy-in on average — monitor recovery and consider backing off volume if performance dips.");
      } else if (balance > 0.8 && n >= 4) {
        insights.push("Energy-in is outpacing energy-out — good headroom; a solid window to add quality volume or intensity.");
      }
      if (insights.length === 0) {
        insights.push(`Across ${weeksActive} active week${weeksActive === 1 ? "" : "s"}, you're averaging ${sessionsPerWeek.toFixed(1)} sessions per week — keep logging to sharpen these trends.`);
      }
    }

    return {
      logs,
      n,
      totalSets,
      avgRpe,
      rpeN,
      rpeCounts,
      weeksActive,
      sessionsPerWeek,
      consistencyPct,
      lastDate,
      daysSince,
      recent7,
      avgIn,
      avgOut,
      balance,
      weeklySeries,
      energyInDeltaPct,
      sortedTypes,
      topType,
      topTypePct,
      insights: insights.slice(0, 4),
      exerciseBests,
    };
  }, [progress, settings]);

  const weeklyEnergy = analysis.weeklySeries;

  const prs: ResultPR[] =
    settings?.resultsBoard?.prs ??
    [
      { label: "Weighted Pull-Up", current: "35", target: "40", unit: "kg" },
      { label: "Weighted Dip", current: "50", target: "60", unit: "kg" },
      { label: "5K Time", current: "22:30", target: "19:59", unit: "min:sec" },
      { label: "Muscle-Ups", current: "5", target: "10", unit: "reps" },
    ];

  const energyChart = useMemo(() => {
    const rows = weeklyEnergy;
    if (!rows.length) return { inLine: "", outLine: "", areaIn: "", areaOut: "", maxY: 10, rows: [] as typeof rows };
    const maxRaw = Math.max(...rows.flatMap((r) => [r.energyIn, r.energyOut]), 1);
    const maxY = Math.max(1, Math.ceil(maxRaw * 1.15 * 10) / 10);
    const top = 8;
    const bottom = 92;
    const h = bottom - top;
    const ptsIn = rows.map((r, i) => {
      const x = rows.length === 1 ? 50 : (i / (rows.length - 1)) * 100;
      const y = bottom - (r.energyIn / maxY) * h;
      return `${x},${y}`;
    });
    const ptsOut = rows.map((r, i) => {
      const x = rows.length === 1 ? 50 : (i / (rows.length - 1)) * 100;
      const y = bottom - (r.energyOut / maxY) * h;
      return `${x},${y}`;
    });
    const firstX = rows.length === 1 ? 50 : 0;
    const lastX = rows.length === 1 ? 50 : 100;
    const areaIn = `${firstX},${bottom} ${ptsIn.join(" ")} ${lastX},${bottom}`;
    const areaOut = `${firstX},${bottom} ${ptsOut.join(" ")} ${lastX},${bottom}`;
    return {
      inLine: ptsIn.join(" "),
      outLine: ptsOut.join(" "),
      areaIn,
      areaOut,
      maxY,
      rows,
    };
  }, [weeklyEnergy]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-stack">
          <div className="loading-label">Loading Results</div>
          <div className="loading-track">
            <div className="loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  const empty = analysis.n === 0;

  return (
    <div className="results-root">
      <header className="results-hero">
        <h1
          className="bebas"
          style={{ fontSize: "clamp(40px, 8vw, 64px)", letterSpacing: "0.06em", lineHeight: 0.95, marginBottom: "10px" }}
        >
          TRAINING <span style={{ color: "var(--accent)" }}>RESULTS</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: "var(--text2)", maxWidth: "560px", lineHeight: 1.5 }}>
          Volume, energy, and session mix — distilled into trends you can act on. PR targets sit alongside your training data.
        </p>
        <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <Link
            href="/progress"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              borderBottom: "1px solid var(--accent)",
              paddingBottom: "2px",
            }}
          >
            Open progress log
          </Link>
          <span style={{ color: "var(--border2)" }}>|</span>
          <span className="mono" style={{ fontSize: "12px", color: "var(--muted)" }}>
            {analysis.n} session{analysis.n === 1 ? "" : "s"} · {analysis.weeksActive} week{analysis.weeksActive === 1 ? "" : "s"} active
            {analysis.lastDate ? ` · last ${formatShortDate(analysis.lastDate)}` : ""}
          </span>
        </div>
      </header>

      {empty ? (
        <div className="results-empty">
          <p className="bebas" style={{ fontSize: "32px", letterSpacing: "0.05em", color: "var(--text)", marginBottom: "12px" }}>
            NO DATA YET
          </p>
          <p style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
            Log workouts from the dashboard to unlock weekly energy trends, session mix, and personalised insights.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "var(--accent)",
              color: "#0a0a0a",
              padding: "12px 20px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            Go to dashboard
          </Link>
        </div>
      ) : null}

      {!empty && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "24px", alignItems: "start" }}>
            <div className="results-grid-metrics" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginBottom: 0 }}>
              {[
                {
                  label: "Avg energy in / out",
                  value: `${analysis.avgIn.toFixed(1)} / ${analysis.avgOut.toFixed(1)}`,
                  hint: analysis.balance > 0 ? "Net positive balance" : analysis.balance < 0 ? "Outpacing intake" : "Balanced",
                },
                {
                  label: "Sets logged",
                  value: String(analysis.totalSets),
                  hint: analysis.avgRpe != null ? `Avg RPE ${analysis.avgRpe.toFixed(1)}` : "Add RPE on sets for depth",
                },
              ].map((card) => (
                <div key={card.label} className="results-metric-card results-card-glass">
                  <div className="mono" style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {card.label}
                  </div>
                  <div className="bebas" style={{ fontSize: "38px", lineHeight: 1, color: "var(--accent)", marginBottom: "6px" }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{card.hint}</div>
                </div>
              ))}
            </div>

            <div className="results-metric-card results-card-glass" style={{ width: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
              <div className="mono" style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "12px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Consistency Score
              </div>
              <div className="consistency-ring">
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="2.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray={`${analysis.consistencyPct}, 100`} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span className="bebas" style={{ fontSize: "28px", lineHeight: 1 }}>{analysis.consistencyPct}%</span>
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "10px", textAlign: "center" }}>
                {analysis.sessionsPerWeek.toFixed(1)} / {settings?.programConfig?.targetSessionsPerWeek ?? 4} target
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
            {analysis.insights.length > 0 && (
              <div className="results-insight-panel" style={{ marginBottom: 0 }}>
                <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "10px" }}>
                  Analysis
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--text2)", fontSize: "15px", lineHeight: 1.6 }}>
                  {analysis.insights.map((line, i) => (
                    <li key={i} style={{ marginBottom: i === analysis.insights.length - 1 ? 0 : "6px" }}>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="results-panel" style={{ padding: "14px 18px" }}>
              <div className="results-panel-title" style={{ marginBottom: "8px" }}>RPE Distribution (Intensity)</div>
              <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "12px", lineHeight: 1.4 }}>
                Spread of effort across your logged sets. High peaks (8+) indicate proximity to failure.
              </div>
              <div className="rpe-heatmap">
                {analysis.rpeCounts.map((count, i) => {
                  const labels = ["≤5", "6", "7", "8", "9+"];
                  const colors = ["#222", "#3a3a3a", "#5a5a5a", "var(--accent)", "var(--accent3)"];
                  const max = Math.max(...analysis.rpeCounts, 1);
                  const h = (count / max) * 100;
                  return (
                    <div
                      key={i}
                      className="rpe-block"
                      data-hint={`${labels[i]} RPE: ${count} sets`}
                      style={{
                        background: colors[i],
                        opacity: count > 0 ? 0.4 + (h / 100) * 0.6 : 0.1,
                        border: i >= 3 && count > 0 ? "1px solid rgba(255,255,255,0.2)" : "none"
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }} className="mono">
                {["Light", "Med", "High", "Peak", "Limit"].map((l, i) => (
                  <span key={l} style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="results-two-col">
            <div className="results-panel">
              <div className="results-panel-title">Weekly energy (avg per log)</div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "220px", display: "block", borderRadius: "6px", background: "linear-gradient(180deg, #121212 0%, #0c0c0c 100%)" }}>
                <defs>
                  <linearGradient id="fillIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="fillOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent2)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--accent2)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1a1a1a" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
                ))}
                {energyChart.areaIn && (
                  <polygon points={energyChart.areaIn} fill="url(#fillIn)" stroke="none" />
                )}
                {energyChart.areaOut && (
                  <polygon points={energyChart.areaOut} fill="url(#fillOut)" stroke="none" />
                )}
                {energyChart.inLine && <polyline points={energyChart.inLine} fill="none" stroke="var(--accent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
                {energyChart.outLine && <polyline points={energyChart.outLine} fill="none" stroke="var(--accent2)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
              </svg>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px", marginTop: "10px" }} className="mono">
                {energyChart.rows.map((r, i) => (
                  <span key={`${r.week}-${i}`} style={{ fontSize: "10px", color: "var(--muted)" }}>
                    W{r.week}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>
                <span>
                  <span style={{ color: "var(--accent)" }}>●</span> Energy in
                </span>
                <span>
                  <span style={{ color: "var(--accent2)" }}>●</span> Energy out
                </span>
                <span style={{ marginLeft: "auto" }}>Scale 0–{energyChart.maxY.toFixed(1)}</span>
              </div>
            </div>

            <div className="results-panel" style={{ display: "flex", flexDirection: "column" }}>
              <div className="results-panel-title">Session type mix</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
                {analysis.sortedTypes.map(([type, count]) => {
                  const pct = analysis.n ? (count / analysis.n) * 100 : 0;
                  const color = TYPE_COLORS[type] ?? TYPE_COLORS.other;
                  return (
                    <div key={type}>
                      <div className="results-type-row">
                        <span className="results-type-dot" style={{ background: color }} />
                        <span className="mono" style={{ fontSize: "11px", color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.06em", flex: 1 }}>
                          {type}
                        </span>
                        <span className="mono" style={{ fontSize: "11px", color: "var(--muted)" }}>
                          {count} · {Math.round(pct)}%
                        </span>
                      </div>
                      <div style={{ height: "8px", background: "#141414", border: "1px solid var(--border2)", borderRadius: "999px", overflow: "hidden", marginLeft: "18px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, opacity: 0.85, borderRadius: "999px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                Distribution based on the <b>{analysis.n} sessions</b> logged. Helps identify over-specialisation or gaps in the plan.
              </p>
            </div>
          </div>

          <div className="results-panel">
            <div className="results-panel-title">PR targets & bests detected</div>
            <div className="results-pr-grid">
              {prs.map((pr) => {
                const labelLower = pr.label.toLowerCase();
                const isTime = labelLower.includes("5k") || labelLower.includes("time") || pr.unit === "min:sec";
                
                // Match best from logs
                const bestFromLogs = analysis.exerciseBests.get(labelLower);
                const currentValStr = bestFromLogs ? String(bestFromLogs) : pr.current;
                const isFromLogs = !!bestFromLogs;

                const curr = isTime ? toMinutes(currentValStr) : toNumeric(currentValStr);
                const targ = Math.max(isTime ? toMinutes(pr.target) : toNumeric(pr.target), 0.0001);
                const pct = isTime ? Math.max(0, Math.min(100, (targ / curr) * 100)) : Math.max(0, Math.min(100, (curr / targ) * 100));
                
                let sub = `${Math.round(pct)}% toward target`;
                if (isTime) {
                  const gapMin = Math.max(0, curr - targ);
                  sub = gapMin < 0.05 ? "On target zone" : `Shave ${gapMin.toFixed(2)} min to goal`;
                } else {
                  const gap = targ - curr;
                  sub = gap <= 0 ? "Target reached" : `${gap.toFixed(gap % 1 === 0 ? 0 : 1)} ${pr.unit ?? ""} remaining`;
                }
                
                return (
                  <div
                    key={pr.label}
                    style={{
                      border: "1px solid var(--border2)",
                      background: "var(--surface2)",
                      padding: "16px",
                      borderRadius: "8px",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px", alignItems: "start" }}>
                      <div>
                        <div className="mono" style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500, marginBottom: "4px" }}>
                          {pr.label}
                        </div>
                        <div className="mono" style={{ fontSize: "11px", color: "var(--muted)" }}>
                          Target: {pr.target}{pr.unit ? ` ${pr.unit}` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="bebas" style={{ fontSize: "24px", color: "var(--accent)", lineHeight: 1 }}>
                          {currentValStr}{pr.unit && !isTime ? ` ${pr.unit}` : ""}
                        </div>
                        {isFromLogs && <span className="results-best-pill">Auto-Logged</span>}
                      </div>
                    </div>
                    <div style={{ height: "6px", background: "#121212", border: "1px solid var(--border2)", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                          borderRadius: "999px",
                          transition: "width 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                        }}
                      />
                    </div>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--muted)", marginTop: "10px", letterSpacing: "0.04em" }}>{sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!empty && (
        <p style={{ marginTop: "28px", fontSize: "12px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
          PRs with "Auto-Logged" tags are pulled directly from your training logs. Others use your baseline in Admin.
        </p>
      )}
    </div>
  );
}
