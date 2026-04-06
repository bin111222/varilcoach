"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)", push: "var(--push)", run: "var(--run)",
  swim: "var(--swim)", mma: "var(--mma)", rest: "var(--rest)", legs: "var(--legs)",
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

export default function ProgressPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editForm, setEditForm] = useState<{
    energyIn: number;
    energyOut: number;
    sessionNotes: string;
    mmaLog: string;
    exercises: any[];
  }>({
    energyIn: 7,
    energyOut: 7,
    sessionNotes: "",
    mmaLog: "",
    exercises: [],
  });

  useEffect(() => {
    fetchJsonWithTimeout("/api/progress")
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("Progress logs failed to load. Refresh to retry.");
        setLoading(false);
      });
  }, []);

  const filtered = logs.filter(l => {
    if (filterWeek && String(l.weekNumber) !== filterWeek) return false;
    if (filterType && l.sessionType !== filterType) return false;
    return true;
  });

  const weeks = [...new Set(logs.map(l => l.weekNumber))].sort();
  const types = [...new Set(logs.map(l => l.sessionType))];

  const avgEnergyIn = filtered.length ? (filtered.reduce((s, l) => s + l.energyIn, 0) / filtered.length).toFixed(1) : "—";
  const avgEnergyOut = filtered.length ? (filtered.reduce((s, l) => s + l.energyOut, 0) / filtered.length).toFixed(1) : "—";

  function startEdit(log: any) {
    setEditingId(log._id);
    setEditForm({
      energyIn: Number(log.energyIn ?? 7),
      energyOut: Number(log.energyOut ?? 7),
      sessionNotes: log.sessionNotes ?? "",
      mmaLog: log.mmaLog ?? "",
      exercises: log.exercises ? JSON.parse(JSON.stringify(log.exercises)) : [],
    });
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  }

  function closeEdit() {
    setEditingId(null);
    document.body.style.overflow = "auto";
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    const res = await fetch(`/api/progress?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const updated = await res.json();
    if (res.ok && updated?._id) {
      setLogs(prev => prev.map(l => (l._id === id ? updated : l)));
      closeEdit();
    }
    setSavingId(null);
  }

  async function deleteLog(id: string) {
    if (!confirm("Are you sure you want to delete this log?")) return;
    await fetch(`/api/progress?id=${id}`, { method: "DELETE" });
    setLogs(prev => prev.filter(l => l._id !== id));
    if (editingId === id) closeEdit();
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "48px var(--page-pad) 32px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "56px", lineHeight: "0.9", letterSpacing: "2px" }}>
          PROGRESS <span style={{ color: "var(--accent)" }}>LOG</span>
        </h1>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginTop: "10px" }}>
          {logs.length} sessions logged
        </div>
      </div>

      <div style={{ padding: "32px var(--page-pad) 60px" }}>
        {/* Stats */}
        {logs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {[
              { label: "Total Sessions", value: String(filtered.length), sub: "" },
              { label: "Avg Energy In", value: avgEnergyIn, sub: "/ 10" },
              { label: "Avg Energy Out", value: avgEnergyOut, sub: "/ 10" },
              { label: "Weeks Logged", value: String(weeks.length), sub: "" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "var(--accent)" }} />
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: "var(--accent)", lineHeight: "1" }}>
                  {stat.value}<span style={{ fontSize: "18px", color: "var(--muted)" }}>{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)" }}>Filter:</span>
          <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ width: "auto" }}>
            <option value="">All Weeks</option>
            {weeks.map(w => <option key={w} value={String(w)}>Week {w}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: "auto" }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filterWeek || filterType) && (
            <button onClick={() => { setFilterWeek(""); setFilterType(""); }} style={{ background: "none", border: "1px solid var(--border2)", color: "var(--muted)", padding: "6px 12px", borderRadius: "2px", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "1px", cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-stack" style={{ maxWidth: "520px" }}>
            <div className="loading-label">Loading Progress</div>
            <div className="loading-track">
              <div className="loading-bar" />
            </div>
          </div>
        ) : loadError ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--run)", letterSpacing: "1px" }}>
            {loadError}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "64px", color: "#1e1e1e", letterSpacing: "4px", marginBottom: "16px" }}>EMPTY</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase" }}>
              No sessions logged yet.
            </div>
            <Link href="/" style={{ display: "inline-block", marginTop: "20px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--accent)", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "underline" }}>
              Go to Dashboard to log →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((log: any) => (
              <div key={log._id} style={{
                background: "var(--surface)",
                border: `1px solid var(--border)`,
                borderLeft: `3px solid ${TYPE_COLORS[log.sessionType] ?? "var(--border)"}`,
                padding: "20px 24px",
                borderRadius: "2px",
                animation: "fadeInUp 0.2s ease",
              }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "baseline", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", minWidth: "90px" }}>
                    {new Date(log.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "1px", color: TYPE_COLORS[log.sessionType] ?? "var(--text)" }}>
                    {log.dayName}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--muted)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "2px", letterSpacing: "1px" }}>
                    Week {log.weekNumber}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "16px", fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>
                    <span>
                      <span style={{ color: "var(--muted)" }}>In </span>
                      <span style={{ color: log.energyIn >= 7 ? "var(--accent)" : log.energyIn >= 5 ? "var(--run)" : "var(--accent3)" }}>
                        {log.energyIn}
                      </span>
                      <span style={{ color: "var(--muted)" }}>/10</span>
                    </span>
                    <span>
                      <span style={{ color: "var(--muted)" }}>Out </span>
                      <span style={{ color: log.energyOut >= 7 ? "var(--accent)" : log.energyOut >= 5 ? "var(--run)" : "var(--accent3)" }}>
                        {log.energyOut}
                      </span>
                      <span style={{ color: "var(--muted)" }}>/10</span>
                    </span>
                  </div>
                </div>

                {/* Exercise Summary in list */}
                {log.exercises?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                    {log.exercises.map((ex: any, i: number) => (
                      <div key={i} style={{ 
                        background: "rgba(255,255,255,0.03)", 
                        border: "1px solid var(--border)", 
                        padding: "4px 8px", 
                        borderRadius: "2px",
                        fontSize: "12px",
                        fontFamily: "'DM Mono', monospace",
                        color: "var(--text2)"
                      }}>
                        {ex.exerciseName} ({ex.sets?.length} sets)
                      </div>
                    ))}
                  </div>
                )}

                {log.sessionNotes && (
                  <div style={{ fontSize: "15px", color: "var(--text2)", lineHeight: "1.7", marginBottom: "8px" }}>
                    {log.sessionNotes}
                  </div>
                )}
                {log.mmaLog && (
                  <div style={{ fontSize: "15px", color: "var(--muted)", fontStyle: "italic", marginBottom: "8px", fontFamily: "'DM Mono', monospace" }}>
                    MMA: {log.mmaLog}
                  </div>
                )}

                <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button onClick={() => startEdit(log)} style={{ background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "2px", padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
                    Edit
                  </button>
                  <button onClick={() => deleteLog(log._id)} style={{ background: "transparent", color: "var(--accent3)", border: "1px solid var(--accent3)", borderRadius: "2px", padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            width: "100%",
            maxWidth: "700px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "32px",
            borderRadius: "4px",
            position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "1px", margin: 0 }}>
                EDIT <span style={{ color: "var(--accent)" }}>SESSION</span>
              </h2>
              <button onClick={closeEdit} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "24px", cursor: "pointer", fontFamily: "sans-serif" }}>×</button>
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Energy In</label>
                  <input 
                    type="number" min={1} max={10} 
                    value={editForm.energyIn} 
                    onChange={e => setEditForm(f => ({ ...f, energyIn: Number(e.target.value) }))} 
                    style={{ width: "100%", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)" }}
                    placeholder="1-10"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Energy Out</label>
                  <input 
                    type="number" min={1} max={10} 
                    value={editForm.energyOut} 
                    onChange={e => setEditForm(f => ({ ...f, energyOut: Number(e.target.value) }))} 
                    style={{ width: "100%", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)" }}
                    placeholder="1-10"
                  />
                </div>
              </div>

              {editForm.exercises.length > 0 && (
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Exercises</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {editForm.exercises.map((ex, exIdx) => (
                      <div key={exIdx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "16px", borderRadius: "2px" }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--accent)", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                          {ex.exerciseName}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {ex.sets.map((s: any, setIdx: number) => (
                            <div key={setIdx} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 60px", gap: "10px", alignItems: "center" }}>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)" }}>Set {setIdx + 1}</span>
                              <div style={{ position: "relative" }}>
                                <input
                                  value={s.reps}
                                  onChange={e => {
                                    const newExs = [...editForm.exercises];
                                    newExs[exIdx].sets[setIdx].reps = e.target.value;
                                    setEditForm(f => ({ ...f, exercises: newExs }));
                                  }}
                                  style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border2)", borderRadius: "2px", fontSize: "13px" }}
                                  placeholder="Reps (e.g. 8)"
                                />
                                <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>REPS</span>
                              </div>
                              <div style={{ position: "relative" }}>
                                <input
                                  value={s.weight}
                                  onChange={e => {
                                    const newExs = [...editForm.exercises];
                                    newExs[exIdx].sets[setIdx].weight = e.target.value;
                                    setEditForm(f => ({ ...f, exercises: newExs }));
                                  }}
                                  style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border2)", borderRadius: "2px", fontSize: "13px" }}
                                  placeholder="Load (e.g. 20kg)"
                                />
                                <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>LOAD</span>
                              </div>
                              <div style={{ position: "relative" }}>
                                <input
                                  type="number" min={1} max={10}
                                  value={s.rpe ?? ""}
                                  onChange={e => {
                                    const newExs = [...editForm.exercises];
                                    newExs[exIdx].sets[setIdx].rpe = e.target.value ? Number(e.target.value) : undefined;
                                    setEditForm(f => ({ ...f, exercises: newExs }));
                                  }}
                                  style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border2)", borderRadius: "2px", fontSize: "13px" }}
                                  placeholder="RPE"
                                />
                                <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>RPE</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ position: "relative", marginTop: "12px" }}>
                          <textarea
                            value={ex.notes}
                            onChange={e => {
                              const newExs = [...editForm.exercises];
                              newExs[exIdx].notes = e.target.value;
                              setEditForm(f => ({ ...f, exercises: newExs }));
                            }}
                            placeholder="Exercise note (optional)"
                            rows={2}
                            style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border2)", borderRadius: "2px", fontSize: "13px", resize: "vertical" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Session Notes</label>
                <textarea 
                  rows={4} 
                  value={editForm.sessionNotes} 
                  onChange={e => setEditForm(f => ({ ...f, sessionNotes: e.target.value }))} 
                  style={{ width: "100%", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)", resize: "vertical" }}
                  placeholder="How did the session go?"
                />
              </div>

              {logs.find(l => l._id === editingId)?.sessionType === "mma" && (
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>MMA Log</label>
                  <textarea 
                    rows={3} 
                    value={editForm.mmaLog} 
                    onChange={e => setEditForm(f => ({ ...f, mmaLog: e.target.value }))} 
                    style={{ width: "100%", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text)", resize: "vertical" }}
                    placeholder="MMA specific details..."
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button 
                  onClick={() => saveEdit(editingId)} 
                  disabled={!!savingId} 
                  style={{ flex: 1, background: "var(--accent)", color: "#000", border: "none", borderRadius: "2px", padding: "14px", fontFamily: "'DM Mono', monospace", fontSize: "16px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", fontWeight: 600 }}
                >
                  {savingId ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  onClick={closeEdit} 
                  style={{ flex: 1, background: "transparent", color: "var(--muted)", border: "1px solid var(--border2)", borderRadius: "2px", padding: "14px", fontFamily: "'DM Mono', monospace", fontSize: "16px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
