"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)", push: "var(--push)", run: "var(--run)",
  swim: "var(--swim)", mma: "var(--mma)", rest: "var(--rest)", legs: "var(--legs)",
};

export default function ProgressPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    energyIn: 7,
    energyOut: 7,
    sessionNotes: "",
    mmaLog: "",
  });

  useEffect(() => {
    fetch("/api/progress")
      .then(r => r.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
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
    });
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
      setEditingId(null);
    }
    setSavingId(null);
  }

  async function deleteLog(id: string) {
    await fetch(`/api/progress?id=${id}`, { method: "DELETE" });
    setLogs(prev => prev.filter(l => l._id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "48px var(--page-pad) 32px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "56px", lineHeight: "0.9", letterSpacing: "2px" }}>
          PROGRESS <span style={{ color: "var(--accent)" }}>LOG</span>
        </h1>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginTop: "10px" }}>
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
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: "var(--accent)", lineHeight: "1" }}>
                  {stat.value}<span style={{ fontSize: "18px", color: "var(--muted)" }}>{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)" }}>Filter:</span>
          <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ width: "auto" }}>
            <option value="">All Weeks</option>
            {weeks.map(w => <option key={w} value={String(w)}>Week {w}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: "auto" }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filterWeek || filterType) && (
            <button onClick={() => { setFilterWeek(""); setFilterType(""); }} style={{ background: "none", border: "1px solid var(--border2)", color: "var(--muted)", padding: "6px 12px", borderRadius: "2px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px", cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", letterSpacing: "2px" }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "64px", color: "#1e1e1e", letterSpacing: "4px", marginBottom: "16px" }}>EMPTY</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase" }}>
              No sessions logged yet.
            </div>
            <Link href="/" style={{ display: "inline-block", marginTop: "20px", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "underline" }}>
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
                <div style={{ display: "flex", gap: "16px", alignItems: "baseline", flexWrap: "wrap", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", minWidth: "90px" }}>
                    {new Date(log.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "1px", color: TYPE_COLORS[log.sessionType] ?? "var(--text)" }}>
                    {log.dayName}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "2px", letterSpacing: "1px" }}>
                    Week {log.weekNumber}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "16px", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
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
                {editingId === log._id ? (
                  <div style={{ marginTop: "10px", display: "grid", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Energy In</label>
                        <input type="number" min={1} max={10} value={editForm.energyIn} onChange={e => setEditForm(f => ({ ...f, energyIn: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Energy Out</label>
                        <input type="number" min={1} max={10} value={editForm.energyOut} onChange={e => setEditForm(f => ({ ...f, energyOut: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Session Notes</label>
                      <textarea rows={3} value={editForm.sessionNotes} onChange={e => setEditForm(f => ({ ...f, sessionNotes: e.target.value }))} />
                    </div>
                    {log.sessionType === "mma" && (
                      <div>
                        <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>MMA Log</label>
                        <textarea rows={2} value={editForm.mmaLog} onChange={e => setEditForm(f => ({ ...f, mmaLog: e.target.value }))} />
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button onClick={() => saveEdit(log._id)} disabled={savingId === log._id} style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: "2px", padding: "8px 14px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
                        {savingId === log._id ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border2)", borderRadius: "2px", padding: "8px 14px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {log.sessionNotes && (
                      <div style={{ fontSize: "15px", color: "var(--text2)", lineHeight: "1.7", marginTop: "8px" }}>
                        {log.sessionNotes}
                      </div>
                    )}
                    {log.mmaLog && (
                      <div style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic", marginTop: "6px", fontFamily: "'DM Mono', monospace" }}>
                        MMA: {log.mmaLog}
                      </div>
                    )}
                  </>
                )}
                {editingId !== log._id && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => startEdit(log)} style={{ background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "2px", padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
                      Edit
                    </button>
                    <button onClick={() => deleteLog(log._id)} style={{ background: "transparent", color: "var(--accent3)", border: "1px solid var(--accent3)", borderRadius: "2px", padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
