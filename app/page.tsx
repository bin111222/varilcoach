"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AICoach from "@/components/AICoach";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)",
  push: "var(--push)",
  run: "var(--run)",
  swim: "var(--swim)",
  mma: "var(--mma)",
  rest: "var(--rest)",
  legs: "var(--legs)",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const JS_DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

type LoggedExercise = {
  exerciseName: string;
  sets: Array<{ reps: string; weight: string; rpe?: number }>;
  notes: string;
};

function parseSetCount(setsText: string) {
  const match = String(setsText).match(/(\d+)\s*×/);
  const count = match ? Number(match[1]) : 3;
  return Math.min(Math.max(count, 1), 8);
}

function parseRepText(setsText: string) {
  const match = String(setsText).match(/×\s*([^\n]+)/);
  return match ? match[1].trim() : "";
}

function buildLoggedExercises(day: any): LoggedExercise[] {
  if (!day?.exercises?.length) return [];
  return day.exercises.map((ex: any) => {
    const setCount = parseSetCount(ex.sets ?? "");
    const repText = parseRepText(ex.sets ?? "");
    return {
      exerciseName: ex.name ?? "Exercise",
      sets: Array.from({ length: setCount }, () => ({
        reps: repText,
        weight: ex.load ?? "BW",
        rpe: ex.rpe ?? undefined,
      })),
      notes: "",
    };
  });
}

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

export default function Dashboard() {
  const [settings, setSettings] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [recentProgress, setRecentProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    energyIn: 7,
    energyOut: 7,
    sessionNotes: "",
    mmaLog: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);

  const todayId = JS_DAY_MAP[new Date().getDay()];

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          fetchJsonWithTimeout("/api/settings"),
          fetchJsonWithTimeout("/api/progress"),
        ]);
        if (s.error) {
          setDbError(s.error);
          setLoading(false);
          return;
        }
        setSettings(s);

        const w = await fetchJsonWithTimeout(`/api/weeks/${s.currentWeek ?? 1}`);
        setWeek(w);

        setRecentProgress(Array.isArray(p) ? p.slice(0, 5) : []);
      } catch (e) {
        setDbError(
          "Loading timed out. Please refresh. If this keeps happening, check Vercel env vars and MongoDB Atlas network access."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todaySession = week?.days?.find((d: any) => d.id === todayId);
  const currentWeekNum = settings?.currentWeek ?? 1;

  async function logSession() {
    if (!todaySession) return;
    setSaving(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber: currentWeekNum,
        dayId: todaySession.id,
        dayName: todaySession.name,
        sessionType: todaySession.type,
        ...logForm,
        exercises: loggedExercises,
      }),
    });
    setSaving(false);
    setSaved(true);
    setLogOpen(false);
    setTimeout(() => setSaved(false), 3000);
    const pRes = await fetch("/api/progress");
    const p = await pRes.json();
    setRecentProgress(Array.isArray(p) ? p.slice(0, 5) : []);
  }

  function toggleLog() {
    if (logOpen) {
      setLogOpen(false);
      return;
    }
    setLoggedExercises(buildLoggedExercises(todaySession));
    setLogOpen(true);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-stack">
          <div className="loading-label">Loading Dashboard</div>
          <div className="loading-track">
            <div className="loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div style={{ padding: "60px var(--page-pad)" }}>
        <div style={{
          background: "#1a0a00",
          border: "1px solid var(--run)",
          borderLeft: "3px solid var(--run)",
          padding: "28px 32px",
          maxWidth: "600px",
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: "var(--run)", letterSpacing: "2px", marginBottom: "12px" }}>
            DATABASE NOT CONNECTED
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "#9a7040", letterSpacing: "1px", lineHeight: "1.8" }}>
            {dbError}
          </div>
          <div style={{ marginTop: "20px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px", lineHeight: "2" }}>
            1. Copy <code style={{ color: "var(--accent)" }}>.env.local.example</code> → <code style={{ color: "var(--accent)" }}>.env.local</code><br />
            2. Add your <code style={{ color: "var(--accent)" }}>MONGODB_URI</code> and <code style={{ color: "var(--accent)" }}>OPENAI_API_KEY</code><br />
            3. Restart the dev server
          </div>
        </div>
      </div>
    );
  }

  const needsSeed = !week || week.error;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {needsSeed && (
        <div style={{
          background: "#1a0a00",
          border: "1px solid var(--run)",
          padding: "20px var(--page-pad)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "14px",
          color: "var(--run)",
          letterSpacing: "1px",
          display: "flex",
          gap: "24px",
          alignItems: "center",
        }}>
          <span>No programme data found.</span>
          <button
            onClick={async () => {
              await fetch("/api/seed", { method: "POST" });
              window.location.reload();
            }}
            style={{
              background: "var(--run)",
              color: "#000",
              border: "none",
              padding: "6px 16px",
              borderRadius: "2px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Seed Week 1 &amp; 2
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "48px var(--page-pad) 32px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "8px",
          }}>
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "64px",
            lineHeight: "0.9",
            letterSpacing: "2px",
          }}>
            {settings?.athleteName ? (
              <>GOOD {getTimeOfDay()},<br /><span style={{ color: "var(--accent)" }}>{settings.athleteName.toUpperCase()}</span></>
            ) : (
              <>YOUR <span style={{ color: "var(--accent)" }}>DASHBOARD</span></>
            )}
          </h1>
        </div>
        <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--muted)" }}>
          <div style={{ color: "var(--accent)", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
            Currently On
          </div>
          <div style={{ color: "var(--text)", fontSize: "24px", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>
            WEEK {currentWeekNum}
          </div>
          <Link href="/program" style={{
            color: "var(--muted)",
            fontSize: "15px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textDecoration: "underline",
          }}>
            View Programme →
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "var(--dashboard-cols)", minHeight: "calc(100vh - 200px)" }}>
        {/* Left: today + week strip + progress */}
        <div style={{ borderRight: "var(--dash-divider)", padding: "40px var(--page-pad)" }}>

          {/* Today's session */}
          {todaySession && (
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>
                Today's Session
              </div>

              <div style={{
                border: `1px solid ${TYPE_COLORS[todaySession.type] ?? "var(--border)"}`,
                borderLeft: `3px solid ${TYPE_COLORS[todaySession.type] ?? "var(--border)"}`,
                background: `${TYPE_COLORS[todaySession.type]}08`,
                padding: "24px 28px",
                borderRadius: "2px",
                marginBottom: "20px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "40px",
                    letterSpacing: "2px",
                    color: TYPE_COLORS[todaySession.type],
                    lineHeight: "1",
                  }}>
                    {todaySession.name}
                    {todaySession.optional && (
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "15px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "var(--legs)",
                        border: "1px solid var(--legs)",
                        padding: "2px 8px",
                        borderRadius: "2px",
                        marginLeft: "12px",
                        verticalAlign: "middle",
                      }}>Optional</span>
                    )}
                  </h2>
                  {todaySession.badge && (
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "15px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      border: `1px solid ${TYPE_COLORS[todaySession.type]}`,
                      color: TYPE_COLORS[todaySession.type],
                      borderRadius: "2px",
                      background: `${TYPE_COLORS[todaySession.type]}0d`,
                    }}>
                      {todaySession.badge}
                    </span>
                  )}
                </div>

                {todaySession.exercises?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {todaySession.exercises.slice(0, 5).map((ex: any, i: number) => (
                      <div key={i} style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "baseline",
                        fontSize: "15px",
                      }}>
                        <span style={{
                          color: ex.highlight ? TYPE_COLORS[todaySession.type] : "var(--text)",
                          fontWeight: ex.highlight ? 600 : 400,
                          minWidth: "180px",
                        }}>
                          {ex.highlight && "★ "}{ex.name}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--text2)" }}>
                          {ex.sets}
                        </span>
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "15px",
                          color: ex.load === "BW" ? "var(--muted)" : TYPE_COLORS[todaySession.type],
                        }}>
                          {ex.load}
                        </span>
                      </div>
                    ))}
                    {todaySession.exercises.length > 5 && (
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px" }}>
                        +{todaySession.exercises.length - 5} more exercises
                      </div>
                    )}
                  </div>
                )}

                {todaySession.type === "swim" && todaySession.drills?.length > 0 && (
                  <div style={{ fontSize: "15px", color: "var(--text2)" }}>
                    {todaySession.drills.length} drills &middot; {todaySession.sessionNote}
                  </div>
                )}

                {todaySession.type === "run" && todaySession.runStats && (
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {todaySession.runStats.map((s: any, i: number) => (
                      <div key={i}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>{s.label}</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "var(--run)", lineHeight: "1" }}>{s.value}</div>
                        <div style={{ fontSize: "15px", color: "var(--muted)", marginTop: "2px" }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {todaySession.type === "mma" && (
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--muted)", letterSpacing: "1px" }}>
                    Fight session. Log energy in/out after.
                  </div>
                )}

                {todaySession.type === "rest" && (
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#1e1e1e", letterSpacing: "4px" }}>
                    REST
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Link
                  href={`/program?week=${currentWeekNum}&day=${todaySession.id}`}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    background: "var(--accent)",
                    color: "#000",
                    borderRadius: "2px",
                    fontWeight: 500,
                    display: "inline-block",
                  }}
                >
                  Full Session →
                </Link>
                <button
                  onClick={toggleLog}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    background: "transparent",
                    color: "var(--muted)",
                    border: "1px solid var(--border2)",
                    borderRadius: "2px",
                  }}
                >
                  {logOpen ? "Cancel" : "Log Session"}
                </button>
                {saved && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--accent)", letterSpacing: "1px", alignSelf: "center" }}>
                    ✓ Saved
                  </span>
                )}
              </div>

              {/* Quick log */}
              {logOpen && (
                <div style={{
                  marginTop: "20px",
                  background: "var(--surface)",
                  border: "1px solid var(--border2)",
                  padding: "24px",
                  borderRadius: "2px",
                  animation: "fadeInUp 0.2s ease",
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "20px" }}>
                    Quick Session Log
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                        Energy In (1–10)
                      </label>
                      <input
                        type="range" min={1} max={10}
                        value={logForm.energyIn}
                        onChange={e => setLogForm(f => ({ ...f, energyIn: Number(e.target.value) }))}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "var(--accent)" }}>{logForm.energyIn}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                        Energy Out (1–10)
                      </label>
                      <input
                        type="range" min={1} max={10}
                        value={logForm.energyOut}
                        onChange={e => setLogForm(f => ({ ...f, energyOut: Number(e.target.value) }))}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "var(--accent)" }}>{logForm.energyOut}</div>
                    </div>
                  </div>
                  {loggedExercises.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                        Exercises Performed
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {loggedExercises.map((ex, exIdx) => (
                          <div key={`${ex.exerciseName}-${exIdx}`} style={{ border: "1px solid var(--border)", background: "var(--surface2)", padding: "12px", borderRadius: "2px" }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--text)", marginBottom: "8px" }}>
                              {ex.exerciseName}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {ex.sets.map((s, setIdx) => (
                                <div key={setIdx} style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr", gap: "10px", alignItems: "center" }}>
                                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)" }}>
                                    Set {setIdx + 1}
                                  </span>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      value={s.reps}
                                      onChange={e => setLoggedExercises(prev => prev.map((p, i) => i === exIdx ? { ...p, sets: p.sets.map((ps, si) => si === setIdx ? { ...ps, reps: e.target.value } : ps) } : p))}
                                      placeholder="Reps"
                                      style={{ width: "100%", paddingRight: "35px" }}
                                    />
                                    <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "rgba(255,255,255,0.15)", pointerEvents: "none", fontFamily: "'DM Mono', monospace" }}>REPS</span>
                                  </div>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      value={s.weight}
                                      onChange={e => setLoggedExercises(prev => prev.map((p, i) => i === exIdx ? { ...p, sets: p.sets.map((ps, si) => si === setIdx ? { ...ps, weight: e.target.value } : ps) } : p))}
                                      placeholder="Load"
                                      style={{ width: "100%", paddingRight: "35px" }}
                                    />
                                    <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "rgba(255,255,255,0.15)", pointerEvents: "none", fontFamily: "'DM Mono', monospace" }}>LOAD</span>
                                  </div>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={s.rpe ?? ""}
                                      onChange={e => setLoggedExercises(prev => prev.map((p, i) => i === exIdx ? { ...p, sets: p.sets.map((ps, si) => si === setIdx ? { ...ps, rpe: e.target.value ? Number(e.target.value) : undefined } : ps) } : p))}
                                      placeholder="RPE"
                                      style={{ width: "100%", paddingRight: "30px" }}
                                    />
                                    <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "rgba(255,255,255,0.15)", pointerEvents: "none", fontFamily: "'DM Mono', monospace" }}>RPE</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <textarea
                              value={ex.notes}
                              onChange={e => setLoggedExercises(prev => prev.map((p, i) => i === exIdx ? { ...p, notes: e.target.value } : p))}
                              placeholder="Exercise note (optional)"
                              rows={2}
                              style={{ width: "100%", resize: "vertical", marginTop: "10px" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {todaySession.type === "mma" && (
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                        MMA Log
                      </label>
                      <textarea
                        value={logForm.mmaLog}
                        onChange={e => setLogForm(f => ({ ...f, mmaLog: e.target.value }))}
                        placeholder="Intensity, sparring quality, anything notable..."
                        rows={3}
                        style={{ width: "100%", resize: "vertical" }}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                      Session Notes
                    </label>
                    <textarea
                      value={logForm.sessionNotes}
                      onChange={e => setLogForm(f => ({ ...f, sessionNotes: e.target.value }))}
                      placeholder="How did it feel? Any PRs? Form notes..."
                      rows={3}
                      style={{ width: "100%", resize: "vertical" }}
                    />
                  </div>
                  <button
                    onClick={logSession}
                    disabled={saving}
                    style={{
                      background: "var(--accent)",
                      color: "#000",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "2px",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "14px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Log"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Week strip */}
          {week?.days && (
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                Week {currentWeekNum} Overview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                {week.days.map((day: any) => {
                  const isToday = day.id === todayId;
                  const color = TYPE_COLORS[day.type] ?? "var(--rest)";
                  return (
                    <Link
                      key={day.id}
                      href={`/program?week=${currentWeekNum}&day=${day.id}`}
                      style={{
                        padding: "16px 12px",
                        borderRight: "1px solid var(--border)",
                        background: isToday ? "var(--surface)" : "transparent",
                        position: "relative",
                        textDecoration: "none",
                        display: "block",
                      }}
                    >
                      {isToday && (
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "2px",
                          background: color,
                        }} />
                      )}
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "1px", color, display: "block" }}>
                        {day.id.toUpperCase().slice(0, 3)}
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--muted)", marginTop: "4px" }}>
                        {day.type}{day.optional ? "?" : ""}
                      </div>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, marginTop: "8px" }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority stack */}
          {week?.priorityStack?.length > 0 && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                Week {currentWeekNum} Priority Stack
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {week.priorityStack.map((item: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "12px", fontSize: "15px", color: "var(--text2)" }}>
                    <span style={{ color: "var(--accent)", fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent logs */}
          {recentProgress.length > 0 && (
            <div style={{ marginTop: "48px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                Recent Sessions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentProgress.map((log: any) => (
                  <div key={log._id} style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    fontSize: "14px",
                  }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", minWidth: "80px" }}>
                      {new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <span style={{ color: TYPE_COLORS[log.sessionType] ?? "var(--text2)", fontWeight: 500 }}>
                      {log.dayName}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginLeft: "auto" }}>
                      W{log.weekNumber} · In {log.energyIn}/10 · Out {log.energyOut}/10
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/progress" style={{
                display: "inline-block",
                marginTop: "12px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "15px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--muted)",
                textDecoration: "underline",
              }}>
                View All Progress →
              </Link>
            </div>
          )}
        </div>

        {/* Right: AI Coach */}
        <div style={{ display: "flex", flexDirection: "column", borderTop: "var(--ai-panel-border-top)" }}>
          <AICoach />
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "MORNING";
  if (h < 17) return "AFTERNOON";
  return "EVENING";
}
