"use client";

import { useEffect, useRef, useState } from "react";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)", push: "var(--push)", run: "var(--run)",
  swim: "var(--swim)", mma: "var(--mma)", rest: "var(--rest)", legs: "var(--legs)",
};

const TYPES = ["pull", "push", "legs", "swim", "run", "mma", "rest"] as const;

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Btn({ onClick, children, variant = "default", disabled = false }: {
  onClick: () => void; children: React.ReactNode;
  variant?: "default" | "accent" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border2)" },
    accent: { background: "var(--accent)", color: "#000", border: "1px solid var(--accent)" },
    danger: { background: "transparent", color: "var(--accent3)", border: "1px solid var(--accent3)" },
    ghost: { background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        fontFamily: "'DM Mono', monospace",
        fontSize: "14px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        padding: "7px 14px",
        borderRadius: "2px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Exercise Editor ────────────────────────────────────────────────────────
function ExerciseEditor({
  exercises,
  accentColor,
  onChange,
}: {
  exercises: any[];
  accentColor: string;
  onChange: (exercises: any[]) => void;
}) {
  function updateEx(i: number, field: string, value: any) {
    const updated = exercises.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex);
    onChange(updated);
  }

  function addEx() {
    onChange([...exercises, { name: "New Exercise", highlight: false, sets: "3 × 8", load: "BW", loadColor: "", rpe: 7, notes: "" }]);
  }

  function removeEx(i: number) {
    onChange(exercises.filter((_, idx) => idx !== i));
  }

  function moveEx(i: number, dir: -1 | 1) {
    const arr = [...exercises];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  }

  return (
    <div>
      {exercises.map((ex, i) => (
        <div key={i} style={{
          background: "var(--surface)",
          border: `1px solid ${ex.highlight ? accentColor + "40" : "var(--border)"}`,
          borderLeft: `3px solid ${ex.highlight ? accentColor : "var(--border)"}`,
          padding: "16px 20px",
          borderRadius: "2px",
          marginBottom: "12px",
        }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <input
                value={ex.name}
                onChange={e => updateEx(i, "name", e.target.value)}
                style={{ width: "100%", fontWeight: ex.highlight ? 600 : 400 }}
                placeholder="Exercise name"
              />
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <Btn onClick={() => moveEx(i, -1)} variant="ghost">↑</Btn>
              <Btn onClick={() => moveEx(i, 1)} variant="ghost">↓</Btn>
              <Btn onClick={() => removeEx(i)} variant="danger">✕</Btn>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
            <Field label="Sets × Reps">
              <input value={ex.sets} onChange={e => updateEx(i, "sets", e.target.value)} style={{ width: "100%", fontSize: "14px" }} placeholder="3 × 8" />
            </Field>
            <Field label="Load">
              <input value={ex.load} onChange={e => updateEx(i, "load", e.target.value)} style={{ width: "100%", fontSize: "14px" }} placeholder="BW or 20 kg" />
            </Field>
            <Field label={`RPE: ${ex.rpe}`}>
              <input type="range" min={1} max={10} value={ex.rpe}
                onChange={e => updateEx(i, "rpe", Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
            </Field>
            <Field label="Progression">
              <input value={ex.progression ?? ""} onChange={e => updateEx(i, "progression", e.target.value)} style={{ width: "100%", fontSize: "14px" }} placeholder="↑ +5kg" />
            </Field>
          </div>

          <Field label="Notes">
            <input value={ex.notes} onChange={e => updateEx(i, "notes", e.target.value)} style={{ width: "100%", fontSize: "14px" }} placeholder="Coaching note..." />
          </Field>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px", cursor: "pointer" }}>
              <input type="checkbox" checked={ex.highlight} onChange={e => updateEx(i, "highlight", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              ★ Highlight
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px", cursor: "pointer" }}>
              <input type="checkbox" checked={ex.optional ?? false} onChange={e => updateEx(i, "optional", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              Optional
            </label>
          </div>
        </div>
      ))}
      <Btn onClick={addEx} variant="ghost">+ Add Exercise</Btn>
    </div>
  );
}

// ─── Drill Editor ────────────────────────────────────────────────────────────
function DrillEditor({ drills, onChange }: { drills: any[]; onChange: (d: any[]) => void }) {
  function updateDrill(i: number, field: string, value: any) {
    onChange(drills.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }
  return (
    <div>
      {drills.map((drill, i) => (
        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--swim)", padding: "16px 20px", borderRadius: "2px", marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <Field label="Drill Name">
              <input value={drill.name} onChange={e => updateDrill(i, "name", e.target.value)} style={{ width: "100%" }} />
            </Field>
            <Field label="Volume">
              <input value={drill.volume} onChange={e => updateDrill(i, "volume", e.target.value)} style={{ width: "100%" }} placeholder="4 × 25m" />
            </Field>
          </div>
          <Field label="Cue / Description">
            <textarea value={drill.cue} onChange={e => updateDrill(i, "cue", e.target.value)} rows={2} style={{ width: "100%", resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px", cursor: "pointer" }}>
              <input type="checkbox" checked={drill.isNewDrill ?? drill.isNew ?? false} onChange={e => updateDrill(i, "isNewDrill", e.target.checked)} style={{ accentColor: "var(--swim)" }} />
              New drill
            </label>
            <Btn onClick={() => onChange(drills.filter((_, idx) => idx !== i))} variant="danger">Remove</Btn>
          </div>
        </div>
      ))}
      <Btn onClick={() => onChange([...drills, { name: "New Drill", volume: "4 × 25m", cue: "" }])} variant="ghost">+ Add Drill</Btn>
    </div>
  );
}

// ─── Run Interval Editor ─────────────────────────────────────────────────────
function IntervalEditor({ intervals, onChange, title }: { intervals: any[]; onChange: (d: any[]) => void; title: string }) {
  return (
    <div>
      {intervals.map((iv, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", marginBottom: "12px", alignItems: "end" }}>
          <Field label="Label">
            <input value={iv.label} onChange={e => onChange(intervals.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ width: "100%" }} />
          </Field>
          <Field label="Value">
            <input value={iv.value} onChange={e => onChange(intervals.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} style={{ width: "100%" }} placeholder="30 min" />
          </Field>
          <Field label="Sub-text">
            <input value={iv.sub} onChange={e => onChange(intervals.map((x, j) => j === i ? { ...x, sub: e.target.value } : x))} style={{ width: "100%" }} placeholder="@ 4:30/km" />
          </Field>
          <Btn onClick={() => onChange(intervals.filter((_, j) => j !== i))} variant="danger">✕</Btn>
        </div>
      ))}
      <Btn onClick={() => onChange([...intervals, { label: "", value: "", sub: "" }])} variant="ghost">+ Add {title}</Btn>
    </div>
  );
}

// ─── Day Editor ──────────────────────────────────────────────────────────────
function DayEditor({
  day,
  onChange,
}: {
  day: any;
  onChange: (updated: any) => void;
}) {
  const color = TYPE_COLORS[day.type] ?? "var(--text)";

  return (
    <div style={{ padding: "24px", background: "var(--surface2)", border: `1px solid ${color}20`, borderRadius: "2px" }}>
      <Section title="Day Metadata">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
          <Field label="Day Name">
            <input value={day.name} onChange={e => onChange({ ...day, name: e.target.value })} style={{ width: "100%" }} />
          </Field>
          <Field label="Label (e.g. Monday)">
            <input value={day.label} onChange={e => onChange({ ...day, label: e.target.value })} style={{ width: "100%" }} />
          </Field>
          <Field label="Type">
            <select value={day.type} onChange={e => onChange({ ...day, type: e.target.value })} style={{ width: "100%" }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Badge Text">
            <input value={day.badge ?? ""} onChange={e => onChange({ ...day, badge: e.target.value })} style={{ width: "100%" }} placeholder="Strength Focus" />
          </Field>
        </div>
        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "1px", cursor: "pointer" }}>
            <input type="checkbox" checked={day.optional ?? false} onChange={e => onChange({ ...day, optional: e.target.checked })} style={{ accentColor: "var(--accent)" }} />
            Optional day
          </label>
        </div>
      </Section>

      <Section title="Info Box">
        <Field label="Info Box Text">
          <textarea value={day.infoBox ?? ""} onChange={e => onChange({ ...day, infoBox: e.target.value })} rows={2} style={{ width: "100%", resize: "vertical" }} placeholder="Coaching note shown at top of day..." />
        </Field>
      </Section>

      {/* Exercises */}
      {(day.type === "pull" || day.type === "push" || day.type === "legs" || day.type === "run" || day.type === "swim") && (
        <Section title="Exercises">
          <ExerciseEditor
            exercises={day.exercises ?? []}
            accentColor={color}
            onChange={exercises => onChange({ ...day, exercises })}
          />
        </Section>
      )}

      {/* Swim drills */}
      {day.type === "swim" && (
        <Section title="Swim Drills">
          <DrillEditor
            drills={day.drills ?? []}
            onChange={drills => onChange({ ...day, drills })}
          />
          <Field label="Session Note">
            <input value={day.sessionNote ?? ""} onChange={e => onChange({ ...day, sessionNote: e.target.value })} style={{ width: "100%" }} placeholder="Total approx..." />
          </Field>
        </Section>
      )}

      {/* Run */}
      {day.type === "run" && (
        <Section title="Run Details">
          <Section title="Run Stats (displayed as cards)">
            <IntervalEditor
              intervals={day.runStats ?? []}
              onChange={runStats => onChange({ ...day, runStats })}
              title="Stat"
            />
          </Section>
          <Section title="Intervals (session structure)">
            <IntervalEditor
              intervals={day.runIntervals ?? []}
              onChange={runIntervals => onChange({ ...day, runIntervals })}
              title="Interval"
            />
          </Section>
          <Field label="Run Note">
            <textarea value={day.runNote ?? ""} onChange={e => onChange({ ...day, runNote: e.target.value })} rows={2} style={{ width: "100%", resize: "vertical" }} />
          </Field>
        </Section>
      )}

      {/* MMA */}
      {day.type === "mma" && (
        <Section title="MMA Note">
          <Field label="MMA Session Note">
            <textarea value={day.mmaNote ?? ""} onChange={e => onChange({ ...day, mmaNote: e.target.value })} rows={4} style={{ width: "100%", resize: "vertical" }} />
          </Field>
        </Section>
      )}

      {/* Rest */}
      {day.type === "rest" && (
        <Section title="Rest Day Note">
          <Field label="Note">
            <input value={day.sessionNote ?? ""} onChange={e => onChange({ ...day, sessionNote: e.target.value })} style={{ width: "100%" }} />
          </Field>
        </Section>
      )}
    </div>
  );
}

// ─── Week Editor ─────────────────────────────────────────────────────────────
function WeekEditor({ week, onSave, onDelete, onDirtyChange, onRegisterSave }: { week: any; onSave: (w: any) => Promise<void>; onDelete: () => Promise<void>; onDirtyChange?: (dirty: boolean) => void; onRegisterSave?: (save: () => Promise<void>) => void; }) {
  const [data, setData] = useState({ ...week });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeDayId, setActiveDayId] = useState(week.days?.[0]?.id ?? "mon");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setData({ ...week });
    setActiveDayId(week.days?.[0]?.id ?? "mon");
  }, [week]);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(data) !== JSON.stringify(week));
  }, [data, week, onDirtyChange]);

  const activeDay = data.days?.find((d: any) => d.id === activeDayId) ?? data.days?.[0];

  function updateDay(updated: any) {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) => d.id === updated.id ? updated : d),
    }));
  }

  async function save() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
    setSaved(true);
    onDirtyChange?.(false);
    setTimeout(() => setSaved(false), 3000);
  }

  useEffect(() => {
    onRegisterSave?.(save);
  }, [onRegisterSave, data]);

  function updateListItem(field: string, i: number, value: string) {
    const arr = [...(data[field] ?? [])];
    arr[i] = value;
    setData((prev: any) => ({ ...prev, [field]: arr }));
  }

  function addListItem(field: string) {
    setData((prev: any) => ({ ...prev, [field]: [...(prev[field] ?? []), ""] }));
  }

  function removeListItem(field: string, i: number) {
    setData((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, idx: number) => idx !== i) }));
  }

  return (
    <div>
      {/* Week controls */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "32px", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "2px" }}>
          WEEK <span style={{ color: "var(--accent)" }}>{data.number}</span>
        </div>
        <div style={{ flex: 1 }} />
        {saved && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--accent)", letterSpacing: "1px" }}>✓ Saved</span>}
        <Btn onClick={save} variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
        {!confirmDelete ? (
          <Btn onClick={() => setConfirmDelete(true)} variant="danger">Delete Week</Btn>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)" }}>Confirm?</span>
            <Btn onClick={() => { onDelete(); setConfirmDelete(false); }} variant="danger">Yes, Delete</Btn>
            <Btn onClick={() => setConfirmDelete(false)} variant="ghost">Cancel</Btn>
          </div>
        )}
      </div>

      {/* Week meta */}
      <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "24px", marginBottom: "32px" }}>
        <div>
          <Field label="Subtitle">
            <input value={data.subtitle ?? ""} onChange={e => setData((p: any) => ({ ...p, subtitle: e.target.value }))} style={{ width: "100%", fontSize: "14px" }} />
          </Field>
        </div>
        <div>
          <Field label="Priority Stack (one per line)">
            {(data.priorityStack ?? []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <input value={item} onChange={e => updateListItem("priorityStack", i, e.target.value)} style={{ flex: 1, fontSize: "14px" }} />
                <Btn onClick={() => removeListItem("priorityStack", i)} variant="danger">✕</Btn>
              </div>
            ))}
            <Btn onClick={() => addListItem("priorityStack")} variant="ghost">+ Add</Btn>
          </Field>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "24px", marginBottom: "32px" }}>
        <div>
          <Field label="Banner Items">
            {(data.bannerItems ?? []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <input value={item} onChange={e => updateListItem("bannerItems", i, e.target.value)} style={{ flex: 1, fontSize: "14px" }} />
                <Btn onClick={() => removeListItem("bannerItems", i)} variant="danger">✕</Btn>
              </div>
            ))}
            <Btn onClick={() => addListItem("bannerItems")} variant="ghost">+ Add</Btn>
          </Field>
        </div>
        <div>
          <Field label="Flags">
            {(data.flags ?? []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <input value={item} onChange={e => updateListItem("flags", i, e.target.value)} style={{ flex: 1, fontSize: "14px" }} />
                <Btn onClick={() => removeListItem("flags", i)} variant="danger">✕</Btn>
              </div>
            ))}
            <Btn onClick={() => addListItem("flags")} variant="ghost">+ Add</Btn>
          </Field>
          <Field label="Warning Flags">
            {(data.warnFlags ?? []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                <input value={item} onChange={e => updateListItem("warnFlags", i, e.target.value)} style={{ flex: 1, fontSize: "14px" }} />
                <Btn onClick={() => removeListItem("warnFlags", i)} variant="danger">✕</Btn>
              </div>
            ))}
            <Btn onClick={() => addListItem("warnFlags")} variant="ghost">+ Add Warning</Btn>
          </Field>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "12px" }}>
        Edit Days
      </div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap" }}>
        {data.days?.map((day: any) => {
          const isActive = day.id === activeDayId;
          const color = TYPE_COLORS[day.type] ?? "var(--rest)";
          return (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "6px 14px",
                border: `1px solid ${isActive ? color : "var(--border2)"}`,
                background: isActive ? `${color}10` : "transparent",
                color: isActive ? color : "var(--muted)",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              {day.id.toUpperCase().slice(0, 3)} / {day.type}
            </button>
          );
        })}
      </div>

      {activeDay && (
        <DayEditor
          key={activeDay.id}
          day={activeDay}
          onChange={updateDay}
        />
      )}
    </div>
  );
}

// ─── Settings Editor ─────────────────────────────────────────────────────────
function SettingsEditor({ settings, onSave, onDirtyChange, onRegisterSave }: { settings: any; onSave: (s: any) => Promise<void>; onDirtyChange?: (dirty: boolean) => void; onRegisterSave?: (save: () => Promise<void>) => void; }) {
  const [data, setData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData({ ...settings });
  }, [settings]);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(data) !== JSON.stringify(settings));
  }, [data, settings, onDirtyChange]);

  async function save() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
    setSaved(true);
    onDirtyChange?.(false);
    setTimeout(() => setSaved(false), 3000);
  }

  useEffect(() => {
    onRegisterSave?.(save);
  }, [onRegisterSave, data]);

  function updateGoal(i: number, value: string) {
    const goals = [...(data.goals ?? [])];
    goals[i] = value;
    setData((p: any) => ({ ...p, goals }));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px" }}>
          ATHLETE <span style={{ color: "var(--accent)" }}>SETTINGS</span>
        </div>
        <div style={{ flex: 1 }} />
        {saved && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--accent)" }}>✓ Saved</span>}
        <Btn onClick={save} variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "32px" }}>
        <div>
          <Section title="Profile">
            <Field label="Athlete Name">
              <input value={data.athleteName ?? ""} onChange={e => setData((p: any) => ({ ...p, athleteName: e.target.value }))} style={{ width: "100%" }} />
            </Field>
            <Field label="Programme Name">
              <input value={data.programName ?? ""} onChange={e => setData((p: any) => ({ ...p, programName: e.target.value }))} style={{ width: "100%" }} />
            </Field>
            <Field label="Current Week">
              <input type="number" min={1} value={data.currentWeek ?? 1} onChange={e => setData((p: any) => ({ ...p, currentWeek: Number(e.target.value) }))} style={{ width: "100%" }} />
            </Field>
            <Field label="Units">
              <select value={data.units ?? "kg"} onChange={e => setData((p: any) => ({ ...p, units: e.target.value }))} style={{ width: "100%" }}>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </Field>
            <Field label="Injuries / Medical Notes">
              <textarea value={data.injuries ?? ""} onChange={e => setData((p: any) => ({ ...p, injuries: e.target.value }))} rows={3} style={{ width: "100%", resize: "vertical" }} placeholder="Any injuries or limitations the AI should know about..." />
            </Field>
          </Section>
        </div>
        <div>
          <Section title="Goals">
            {(data.goals ?? []).map((goal: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input value={goal} onChange={e => updateGoal(i, e.target.value)} style={{ flex: 1 }} placeholder="Goal..." />
                <Btn onClick={() => setData((p: any) => ({ ...p, goals: p.goals.filter((_: any, j: number) => j !== i) }))} variant="danger">✕</Btn>
              </div>
            ))}
            <Btn onClick={() => setData((p: any) => ({ ...p, goals: [...(p.goals ?? []), ""] }))} variant="ghost">+ Add Goal</Btn>
          </Section>

          <Section title="AI Coach Settings">
            <Field label="OpenAI Model">
              <select value={data.openaiModel ?? "gpt-4o"} onChange={e => setData((p: any) => ({ ...p, openaiModel: e.target.value }))} style={{ width: "100%" }}>
                <option value="gpt-4o">GPT-4o (Recommended)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
              </select>
            </Field>
            <Field label="Custom System Prompt (leave blank for default)">
              <textarea
                value={data.systemPromptOverride ?? ""}
                onChange={e => setData((p: any) => ({ ...p, systemPromptOverride: e.target.value }))}
                rows={5}
                style={{ width: "100%", resize: "vertical", fontSize: "14px" }}
                placeholder="Leave blank to use the auto-generated coaching prompt that includes your programme data and goals..."
              />
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}

function ResultsEditor({ settings, onSave, onDirtyChange, onRegisterSave }: { settings: any; onSave: (s: any) => Promise<void>; onDirtyChange?: (dirty: boolean) => void; onRegisterSave?: (save: () => Promise<void>) => void; }) {
  const [data, setData] = useState<any>({
    ...(settings?.resultsBoard ?? {
      prs: [
        { label: "Weighted Pull-Up", current: "35", target: "40", unit: "kg" },
        { label: "Weighted Dip", current: "50", target: "60", unit: "kg" },
        { label: "5K Time", current: "22:30", target: "19:59", unit: "min:sec" },
        { label: "Muscle-Ups", current: "5", target: "10", unit: "reps" },
      ],
      highlights: ["Consistency streak", "New technique improvements"],
    }),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(data) !== JSON.stringify(settings?.resultsBoard ?? {}));
  }, [data, settings, onDirtyChange]);

  async function save() {
    setSaving(true);
    await onSave({ ...settings, resultsBoard: data });
    setSaving(false);
    setSaved(true);
    onDirtyChange?.(false);
    setTimeout(() => setSaved(false), 2500);
  }

  useEffect(() => {
    onRegisterSave?.(save);
  }, [onRegisterSave, data, settings]);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px" }}>
          RESULTS <span style={{ color: "var(--accent)" }}>EDITOR</span>
        </div>
        <div style={{ flex: 1 }} />
        {saved && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--accent)" }}>Saved ✓</span>}
        <Btn onClick={save} variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Results"}</Btn>
      </div>

      <Section title="PR Board">
        {(data.prs ?? []).map((pr: any, i: number) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", alignItems: "end" }}>
            <input value={pr.label ?? ""} placeholder="Metric" onChange={(e) => setData((p: any) => ({ ...p, prs: p.prs.map((x: any, j: number) => j === i ? { ...x, label: e.target.value } : x) }))} style={{ fontSize: "14px" }} />
            <input value={pr.current ?? ""} placeholder="Current" onChange={(e) => setData((p: any) => ({ ...p, prs: p.prs.map((x: any, j: number) => j === i ? { ...x, current: e.target.value } : x) }))} style={{ fontSize: "14px" }} />
            <input value={pr.target ?? ""} placeholder="Target" onChange={(e) => setData((p: any) => ({ ...p, prs: p.prs.map((x: any, j: number) => j === i ? { ...x, target: e.target.value } : x) }))} style={{ fontSize: "14px" }} />
            <input value={pr.unit ?? ""} placeholder="Unit" onChange={(e) => setData((p: any) => ({ ...p, prs: p.prs.map((x: any, j: number) => j === i ? { ...x, unit: e.target.value } : x) }))} style={{ fontSize: "14px" }} />
            <Btn onClick={() => setData((p: any) => ({ ...p, prs: p.prs.filter((_: any, j: number) => j !== i) }))} variant="danger">✕</Btn>
          </div>
        ))}
        <Btn onClick={() => setData((p: any) => ({ ...p, prs: [...(p.prs ?? []), { label: "", current: "", target: "", unit: "kg" }] }))} variant="ghost">+ Add PR Metric</Btn>
      </Section>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<"weeks" | "settings" | "results" | "data">("weeks");
  const [weeks, setWeeks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [activeWeekNum, setActiveWeekNum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const saveActiveRef = useRef<(() => Promise<void>) | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const confirmResolver = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [w, s] = await Promise.all([
          fetchJsonWithTimeout(`/api/weeks?userId=${userId}`),
          fetchJsonWithTimeout(`/api/settings?userId=${userId}`),
        ]);
        setWeeks(Array.isArray(w) ? w : []);
        setSettings(s);
        if (Array.isArray(w) && w.length > 0) setActiveWeekNum(w[0].number);
      } catch {
        setLoadError("Admin data failed to load. Refresh to retry.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveWeek(updated: any) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    await fetch(`/api/weeks/${updated.number}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updated, userId }),
    });
    setWeeks(prev => prev.map(w => w.number === updated.number ? updated : w));
  }

  async function deleteWeek(number: number) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    await fetch(`/api/weeks/${number}?userId=${userId}`, { method: "DELETE" });
    setWeeks(prev => prev.filter(w => w.number !== number));
    setActiveWeekNum(null);
  }

  async function addWeek() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const maxNum = weeks.reduce((m, w) => Math.max(m, w.number), 0);
    const newWeek = {
      userId,
      number: maxNum + 1,
      subtitle: "Training Programme — Calisthenics / Swim / Run / MMA",
      priorityStack: [],
      bannerItems: [],
      days: [
        { id: "mon", name: "PULL DAY", label: "Monday", type: "pull", optional: false, exercises: [] },
        { id: "tue", name: "LEGS", label: "Tuesday", type: "legs", optional: true, exercises: [] },
        { id: "wed", name: "PUSH DAY", label: "Wednesday", type: "push", optional: false, exercises: [] },
        { id: "thu", name: "SWIM", label: "Thursday", type: "swim", optional: false, exercises: [], drills: [] },
        { id: "fri", name: "RUN", label: "Friday", type: "run", optional: false, exercises: [] },
        { id: "sat", name: "MMA", label: "Saturday", type: "mma", optional: false, exercises: [] },
        { id: "sun", name: "REST", label: "Sunday", type: "rest", optional: false, exercises: [] },
      ],
      flags: [],
      warnFlags: [],
    };
    const res = await fetch("/api/weeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWeek),
    });
    const created = await res.json();
    setWeeks(prev => [...prev, created].sort((a, b) => a.number - b.number));
    setActiveWeekNum(created.number);
  }

  async function saveSettings(updated: any) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updated, userId }),
    });
    setSettings(updated);
  }

  async function handleLeave(action: () => void) {
    if (!hasUnsaved) {
      action();
      return;
    }
    const saveFirst = await askConfirm("You have unsaved changes. Save before leaving?");
    if (saveFirst && saveActiveRef.current) {
      await saveActiveRef.current();
    }
    setHasUnsaved(false);
    action();
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

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasUnsaved) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsaved]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!hasUnsaved) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || e.metaKey || e.ctrlKey) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      // Block navigation immediately in capture phase so router/browser cannot proceed first.
      e.preventDefault();
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();
      const nextHref = url.pathname + url.search + url.hash;
      void handleLeave(() => {
        window.location.assign(nextHref);
      });
    }
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [hasUnsaved]);

  async function seed() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setSeeding(true);
    await fetch("/api/seed", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const w = await fetch(`/api/weeks?userId=${userId}`).then(r => r.json());
    setWeeks(Array.isArray(w) ? w : []);
    if (Array.isArray(w) && w.length > 0) setActiveWeekNum(w[0].number);
    setSeeding(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-stack">
          <div className="loading-label">Loading Admin</div>
          <div className="loading-track">
            <div className="loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: "48px var(--page-pad)", color: "var(--run)", fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>
        {loadError}
      </div>
    );
  }

  const activeWeek = weeks.find(w => w.number === activeWeekNum);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "var(--section-padding) var(--page-pad) 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "var(--header-font-size)", lineHeight: "0.9", letterSpacing: "2px" }}>
            ADMIN <span style={{ color: "var(--accent)" }}>PANEL</span>
          </h1>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginTop: "10px" }}>
            Edit everything live
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn onClick={seed} variant="ghost" disabled={seeding}>
            {seeding ? "Seeding..." : "Seed W1+W2"}
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "16px var(--page-pad)", borderBottom: "1px solid var(--border)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {(["weeks", "settings", "results", "data"] as const).map(t => (
          <button
            key={t}
            onClick={() => handleLeave(() => setTab(t))}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "6px 12px",
              border: `1px solid ${tab === t ? "var(--accent)" : "var(--border2)"}`,
              background: tab === t ? "rgba(200,245,66,0.06)" : "transparent",
              color: tab === t ? "var(--accent)" : "var(--muted)",
              borderRadius: "2px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {t === "weeks" ? "Weeks" : t === "settings" ? "Athlete" : t === "results" ? "Results" : "Data"}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px var(--page-pad) 80px" }}>
        {/* Weeks tab */}
        {tab === "weeks" && (
          <div>
            {/* Week selector */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginRight: "8px" }}>
                Weeks:
              </span>
              {weeks.map(w => (
                <button
                  key={w.number}
                  onClick={() => setActiveWeekNum(w.number)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    padding: "6px 14px",
                    border: `1px solid ${activeWeekNum === w.number ? "var(--accent)" : "var(--border2)"}`,
                    background: activeWeekNum === w.number ? "rgba(200,245,66,0.06)" : "transparent",
                    color: activeWeekNum === w.number ? "var(--accent)" : "var(--muted)",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                >
                  Week {w.number}
                </button>
              ))}
              <Btn onClick={addWeek} variant="ghost">+ New Week</Btn>
            </div>

            {activeWeek ? (
              <WeekEditor
                key={activeWeek.number}
                week={activeWeek}
                onSave={saveWeek}
                onDelete={() => deleteWeek(activeWeek.number)}
                onDirtyChange={setHasUnsaved}
                onRegisterSave={(fn) => {
                  saveActiveRef.current = fn;
                }}
              />
            ) : (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", textAlign: "center", padding: "60px 0" }}>
                No weeks yet. <button onClick={seed} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "underline" }}>Seed W1 + W2</button> or create a new week.
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {tab === "settings" && settings && (
          <SettingsEditor
            settings={settings}
            onSave={saveSettings}
            onDirtyChange={setHasUnsaved}
            onRegisterSave={(fn) => {
              saveActiveRef.current = fn;
            }}
          />
        )}

        {/* Results tab */}
        {tab === "results" && settings && (
          <ResultsEditor
            settings={settings}
            onSave={saveSettings}
            onDirtyChange={setHasUnsaved}
            onRegisterSave={(fn) => {
              saveActiveRef.current = fn;
            }}
          />
        )}

        {/* Data tab */}
        {tab === "data" && (
          <DataTab />
        )}
      </div>

      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
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

function DataTab() {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    energyIn: 7,
    energyOut: 7,
    sessionNotes: "",
    mmaLog: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/progress?userId=${userId}`).then(r => r.json()).then(data => {
      setProgress(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  async function deleteLog(id: string) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    await fetch(`/api/progress?id=${id}&userId=${userId}`, { method: "DELETE" });
    setProgress(prev => prev.filter(p => p._id !== id));
  }

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
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const res = await fetch(`/api/progress?id=${id}&userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, userId }),
    });
    const updated = await res.json();
    if (res.ok && updated?._id) {
      setProgress(prev => prev.map(p => (p._id === id ? updated : p)));
      setEditingId(null);
    }
  }

  if (loading) return <div style={{ color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "15px" }}>Loading...</div>;

  return (
    <div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px", marginBottom: "24px" }}>
        SESSION <span style={{ color: "var(--accent)" }}>LOGS</span>
      </div>
      {progress.length === 0 ? (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "var(--muted)", padding: "40px 0" }}>
          No sessions logged yet. Go to the dashboard and log a session.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {progress.map((log: any) => (
            <div key={log._id} style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              padding: "16px 20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              fontSize: "15px",
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", minWidth: "90px" }}>
                {new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
              </span>
              <span style={{ color: TYPE_COLORS[log.sessionType] ?? "var(--text2)", fontWeight: 500, minWidth: "120px" }}>
                {log.dayName}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)" }}>
                W{log.weekNumber}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)" }}>
                In {log.energyIn}/10 · Out {log.energyOut}/10
              </span>
              {editingId === log._id ? (
                <div style={{ display: "grid", gap: "10px", flex: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "8px" }}>
                    <input type="number" min={1} max={10} value={editForm.energyIn} onChange={e => setEditForm(f => ({ ...f, energyIn: Number(e.target.value) }))} />
                    <input type="number" min={1} max={10} value={editForm.energyOut} onChange={e => setEditForm(f => ({ ...f, energyOut: Number(e.target.value) }))} />
                  </div>
                  <textarea rows={2} value={editForm.sessionNotes} onChange={e => setEditForm(f => ({ ...f, sessionNotes: e.target.value }))} />
                  {log.sessionType === "mma" && (
                    <textarea rows={2} value={editForm.mmaLog} onChange={e => setEditForm(f => ({ ...f, mmaLog: e.target.value }))} />
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Btn onClick={() => saveEdit(log._id)} variant="accent">Save</Btn>
                    <Btn onClick={() => setEditingId(null)} variant="ghost">Cancel</Btn>
                  </div>
                </div>
              ) : (
                <>
                  {log.sessionNotes && (
                    <span style={{ fontSize: "14px", color: "var(--text2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.sessionNotes}
                    </span>
                  )}
                  <Btn onClick={() => startEdit(log)} variant="ghost">Edit</Btn>
                  <Btn onClick={() => deleteLog(log._id)} variant="danger">Delete</Btn>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
