"use client";

import { useMemo, useState, useEffect, useRef } from "react";

const TYPES = ["pull", "push", "legs", "swim", "run", "mma", "rest"] as const;
const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)",
  push: "var(--push)",
  legs: "var(--legs)",
  swim: "var(--swim)",
  run: "var(--run)",
  mma: "var(--mma)",
  rest: "var(--rest)",
};
const DAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function CalendarPage() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [modalDirty, setModalDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const confirmResolver = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchJsonWithTimeout(`/api/weeks?userId=${userId}`),
      fetchJsonWithTimeout(`/api/settings?userId=${userId}`)
    ])
      .then(([w, s]) => {
        setWeeks(Array.isArray(w) ? w : []);
        setSettings(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const scheduleByDate = useMemo(() => {
    const map = new Map<string, any>();
    if (!weeks.length) return map;
    const currentWeek = Number(settings?.currentWeek ?? 1);
    const week1Monday = addDays(getMonday(new Date()), -(currentWeek - 1) * 7);
    for (const week of weeks) {
      for (const day of week.days ?? []) {
        const offset = DAY_IDS.indexOf(day.id);
        if (offset < 0) continue;
        const date = addDays(week1Monday, (Number(week.number) - 1) * 7 + offset);
        map.set(ymd(date), { weekNumber: week.number, dayId: day.id, day });
      }
    }
    return map;
  }, [weeks, settings]);

  function openEdit(entry: any, date: Date) {
    const payload = {
      weekNumber: entry.weekNumber,
      dayId: entry.dayId,
      dateLabel: date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    };
    setModalData(payload);
    setDraft({ ...entry.day });
    setModalDirty(false);
    setModalOpen(true);
  }

  async function saveModal() {
    const userId = localStorage.getItem("userId");
    if (!modalData || !draft || !userId) return;
    const updatedWeek = weeks.find((w) => w.number === modalData.weekNumber);
    if (!updatedWeek) return;
    const finalWeek = {
      ...updatedWeek,
      userId,
      days: updatedWeek.days.map((d: any) => (d.id === modalData.dayId ? { ...draft } : d)),
    };
    setSaving(true);
    const res = await fetch(`/api/weeks/${modalData.weekNumber}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalWeek),
    });
    const saved = await res.json();
    if (res.ok) {
      setWeeks((prev) => prev.map((w) => (w.number === modalData.weekNumber ? saved : w)));
      setModalDirty(false);
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function closeModalWithPrompt() {
    if (!modalDirty || !modalOpen) {
      setModalOpen(false);
      return;
    }
    const shouldSave = await askConfirm(
      "You have unsaved changes. Save before closing?"
    );
    if (shouldSave) {
      await saveModal();
      return;
    }
    setModalDirty(false);
    setModalOpen(false);
  }

  function askConfirm(message: string) {
    setConfirmMessage(message);
    setConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  }

  function handleConfirmResult(value: boolean) {
    setConfirmOpen(false);
    const resolver = confirmResolver.current;
    confirmResolver.current = null;
    resolver?.(value);
  }

  function updateExercise(exIdx: number, field: string, value: any) {
    setModalDirty(true);
    setDraft((p: any) => ({
      ...p,
      exercises: (p.exercises ?? []).map((e: any, i: number) => (i === exIdx ? { ...e, [field]: value } : e)),
    }));
  }

  function addExercise() {
    setModalDirty(true);
    setDraft((p: any) => ({
      ...p,
      exercises: [...(p.exercises ?? []), { name: "New Exercise", sets: "3 × 8", load: "BW", rpe: 7, notes: "", highlight: false, optional: false, loadColor: "", progression: "" }],
    }));
  }

  function removeExercise(exIdx: number) {
    setModalDirty(true);
    setDraft((p: any) => ({ ...p, exercises: (p.exercises ?? []).filter((_: any, i: number) => i !== exIdx) }));
  }

  function updateDrill(i: number, field: string, value: any) {
    setModalDirty(true);
    setDraft((p: any) => ({
      ...p,
      drills: (p.drills ?? []).map((d: any, idx: number) => (idx === i ? { ...d, [field]: value } : d)),
    }));
  }

  function addDrill() {
    setModalDirty(true);
    setDraft((p: any) => ({ ...p, drills: [...(p.drills ?? []), { name: "New Drill", volume: "4 × 25m", cue: "" }] }));
  }

  function removeDrill(i: number) {
    setModalDirty(true);
    setDraft((p: any) => ({ ...p, drills: (p.drills ?? []).filter((_: any, idx: number) => idx !== i) }));
  }

  function updateRunField(section: "runStats" | "runIntervals", i: number, field: string, value: any) {
    setModalDirty(true);
    setDraft((p: any) => ({
      ...p,
      [section]: (p[section] ?? []).map((x: any, idx: number) => (idx === i ? { ...x, [field]: value } : x)),
    }));
  }

  function addRunField(section: "runStats" | "runIntervals") {
    setModalDirty(true);
    setDraft((p: any) => ({ ...p, [section]: [...(p[section] ?? []), { label: "", value: "", sub: "" }] }));
  }

  function removeRunField(section: "runStats" | "runIntervals", i: number) {
    setModalDirty(true);
    setDraft((p: any) => ({ ...p, [section]: (p[section] ?? []).filter((_: any, idx: number) => idx !== i) }));
  }

  const monthGrid = getMonthGrid(activeMonth.getFullYear(), activeMonth.getMonth());

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-stack">
          <div className="loading-label">Loading Calendar</div>
          <div className="loading-track"><div className="loading-bar" /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px var(--page-pad) 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "var(--header-font-size)", letterSpacing: "2px" }}>
          WORKOUT <span style={{ color: "var(--accent)" }}>CALENDAR</span>
        </h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))} style={{ padding: "8px 12px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)" }}>←</button>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--text)", minWidth: "120px", textAlign: "center" }}>
            {activeMonth.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase()}
          </div>
          <button onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))} style={{ padding: "8px 12px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)" }}>→</button>
        </div>
      </div>

      <div style={{ fontFamily: "'DM Mono', monospace", color: "var(--muted)", fontSize: "12px", marginBottom: "16px" }}>
        Bold days are workout days. Click any workout day to edit.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "4px", textAlign: "center" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {monthGrid.map((date) => {
          const key = ymd(date);
          const entry = scheduleByDate.get(key);
          const inMonth = date.getMonth() === activeMonth.getMonth();
          const isWorkout = entry && entry.day.type !== "rest";
          const color = entry ? TYPE_COLORS[entry.day.type] : "var(--border2)";
          return (
            <button
              key={key}
              onClick={() => entry && openEdit(entry, date)}
              disabled={!entry}
              style={{
                minHeight: "clamp(60px, 10vh, 88px)",
                textAlign: "left",
                padding: "6px",
                borderRadius: "2px",
                border: `1px solid ${isWorkout ? color : "var(--border)"}`,
                background: inMonth ? "var(--surface)" : "#0d0d0d",
                opacity: inMonth ? 1 : 0.4,
                cursor: entry ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>{date.getDate()}</div>
              {entry && (
                <div style={{ 
                  marginTop: "4px", 
                  fontFamily: "'DM Mono', monospace", 
                  fontSize: "9px", 
                  color, 
                  fontWeight: isWorkout ? 800 : 500, 
                  letterSpacing: "0.2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%"
                }}>
                  {entry.day.name.toUpperCase()}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {modalOpen && draft && modalData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "2px" }}>{draft.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)" }}>
                  {modalData.dateLabel} - Week {modalData.weekNumber}
                </div>
              </div>
              <button onClick={closeModalWithPrompt} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "8px 10px" }}>Close</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "12px" }}>
              <input value={draft.name ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, name: e.target.value })); }} placeholder="Session Name" />
              <input value={draft.label ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, label: e.target.value })); }} placeholder="Label (Monday...)" />
              <select value={draft.type ?? "pull"} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, type: e.target.value })); }}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="checkbox" checked={Boolean(draft.optional)} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, optional: e.target.checked })); }} />
                Optional Day
              </label>
            </div>

            <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
              <input value={draft.badge ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, badge: e.target.value })); }} placeholder="Badge" />
              <textarea value={draft.infoBox ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, infoBox: e.target.value })); }} rows={2} placeholder="Info box" />
              <textarea value={draft.sessionNote ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, sessionNote: e.target.value })); }} rows={2} placeholder="Session note" />
              <textarea value={draft.runNote ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, runNote: e.target.value })); }} rows={2} placeholder="Run note" />
              <textarea value={draft.mmaNote ?? ""} onChange={(e) => { setModalDirty(true); setDraft((p: any) => ({ ...p, mmaNote: e.target.value })); }} rows={2} placeholder="MMA note" />
              <div style={{ border: "1px solid var(--border2)", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                  Exercises
                </div>
                {(draft.exercises ?? []).map((ex: any, exIdx: number) => (
                  <div key={exIdx} style={{ border: "1px solid var(--border)", padding: "8px", borderRadius: "2px", marginBottom: "8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 80px auto", gap: "8px", alignItems: "end" }}>
                      <input value={ex.name ?? ""} placeholder="Exercise" onChange={(e) => updateExercise(exIdx, "name", e.target.value)} />
                      <input value={ex.sets ?? ""} placeholder="Sets x Reps" onChange={(e) => updateExercise(exIdx, "sets", e.target.value)} />
                      <input value={ex.load ?? ""} placeholder="Load" onChange={(e) => updateExercise(exIdx, "load", e.target.value)} />
                      <input type="number" min={1} max={10} value={ex.rpe ?? ""} placeholder="RPE" onChange={(e) => updateExercise(exIdx, "rpe", Number(e.target.value))} />
                      <button onClick={() => removeExercise(exIdx)} style={{ background: "transparent", border: "1px solid var(--accent3)", color: "var(--accent3)", padding: "10px" }}>✕</button>
                    </div>
                    <textarea value={ex.notes ?? ""} placeholder="Exercise notes" rows={2} onChange={(e) => updateExercise(exIdx, "notes", e.target.value)} style={{ marginTop: "8px" }} />
                  </div>
                ))}
                <button onClick={addExercise} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "8px 10px" }}>+ Add Exercise</button>
              </div>

              <div style={{ border: "1px solid var(--border2)", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                  Swim Drills
                </div>
                {(draft.drills ?? []).map((dr: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "8px", marginBottom: "8px" }}>
                    <input value={dr.name ?? ""} placeholder="Drill name" onChange={(e) => updateDrill(i, "name", e.target.value)} />
                    <input value={dr.volume ?? ""} placeholder="Volume" onChange={(e) => updateDrill(i, "volume", e.target.value)} />
                    <button onClick={() => removeDrill(i)} style={{ background: "transparent", border: "1px solid var(--accent3)", color: "var(--accent3)", padding: "10px" }}>✕</button>
                    <textarea value={dr.cue ?? ""} placeholder="Cue" rows={2} onChange={(e) => updateDrill(i, "cue", e.target.value)} style={{ gridColumn: "1 / span 3" }} />
                  </div>
                ))}
                <button onClick={addDrill} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "8px 10px" }}>+ Add Drill</button>
              </div>

              <div style={{ border: "1px solid var(--border2)", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                  Run Stats
                </div>
                {(draft.runStats ?? []).map((r: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "8px", marginBottom: "8px" }}>
                    <input value={r.label ?? ""} placeholder="Label" onChange={(e) => updateRunField("runStats", i, "label", e.target.value)} />
                    <input value={r.value ?? ""} placeholder="Value" onChange={(e) => updateRunField("runStats", i, "value", e.target.value)} />
                    <input value={r.sub ?? ""} placeholder="Subtext" onChange={(e) => updateRunField("runStats", i, "sub", e.target.value)} />
                    <button onClick={() => removeRunField("runStats", i)} style={{ background: "transparent", border: "1px solid var(--accent3)", color: "var(--accent3)", padding: "10px" }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addRunField("runStats")} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "8px 10px" }}>+ Add Run Stat</button>
              </div>

              <div style={{ border: "1px solid var(--border2)", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                  Run Intervals
                </div>
                {(draft.runIntervals ?? []).map((r: any, i: number) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "8px", marginBottom: "8px" }}>
                    <input value={r.label ?? ""} placeholder="Label" onChange={(e) => updateRunField("runIntervals", i, "label", e.target.value)} />
                    <input value={r.value ?? ""} placeholder="Value" onChange={(e) => updateRunField("runIntervals", i, "value", e.target.value)} />
                    <input value={r.sub ?? ""} placeholder="Subtext" onChange={(e) => updateRunField("runIntervals", i, "sub", e.target.value)} />
                    <button onClick={() => removeRunField("runIntervals", i)} style={{ background: "transparent", border: "1px solid var(--accent3)", color: "var(--accent3)", padding: "10px" }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addRunField("runIntervals")} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "8px 10px" }}>+ Add Run Interval</button>
              </div>
            </div>

            <div style={{ marginTop: "14px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={closeModalWithPrompt} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "10px 14px" }}>Cancel</button>
              <button onClick={saveModal} disabled={saving} style={{ background: "var(--accent)", border: "none", color: "#000", padding: "10px 14px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "1px" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "min(480px, 92vw)", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "18px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px", letterSpacing: "2px", marginBottom: "8px" }}>
              UNSAVED <span style={{ color: "var(--accent)" }}>CHANGES</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", color: "var(--text2)", fontSize: "13px", lineHeight: 1.6 }}>
              {confirmMessage}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => handleConfirmResult(false)} style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", padding: "10px 14px" }}>
                Discard
              </button>
              <button onClick={() => handleConfirmResult(true)} style={{ background: "var(--accent)", border: "none", color: "#000", padding: "10px 14px", fontFamily: "'DM Mono', monospace", letterSpacing: "1px", textTransform: "uppercase" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

