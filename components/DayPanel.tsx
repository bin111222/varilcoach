"use client";

import { IDay, IExercise } from "@/lib/models/Week";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)",
  push: "var(--push)",
  run: "var(--run)",
  swim: "var(--swim)",
  mma: "var(--mma)",
  rest: "var(--rest)",
  legs: "var(--legs)",
};

const TYPE_BG: Record<string, string> = {
  pull: "#1a200a",
  push: "#0a1520",
  run: "#1a1000",
  swim: "#12082a",
  mma: "#1a0505",
  legs: "#0a1a10",
  rest: "#111",
};

function RpeBar({ rpe }: { rpe: number }) {
  return (
    <div className="rpe-bar">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`rpe-pip${i < rpe ? " filled" + (i >= 8 ? " high" : "") : ""}`}
        />
      ))}
    </div>
  );
}

function ExerciseTable({
  exercises,
  hasProgression,
  accentColor,
}: {
  exercises: IExercise[];
  hasProgression: boolean;
  accentColor: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Exercise</th>
            <th style={thStyle}>Sets × Reps</th>
            <th style={thStyle}>Load</th>
            {hasProgression && <th style={thStyle}>vs Prev</th>}
            <th style={thStyle}>RPE</th>
            <th style={thStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #161616" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0e0e0e"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <td style={{ ...tdStyle, color: ex.highlight ? accentColor : "var(--text)", fontWeight: ex.highlight ? 500 : 400 }}>
                {ex.highlight && <span style={{ color: accentColor, marginRight: "6px" }}>★</span>}
                {ex.name}
                {ex.optional && <span style={{ marginLeft: "8px", fontFamily: "'DM Mono', monospace", fontSize: "8px", color: "var(--legs)", border: "1px solid var(--legs)", padding: "1px 6px", borderRadius: "2px" }}>opt</span>}
              </td>
              <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap" }}>{ex.sets}</td>
              <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap" }}>
                <span style={{ color: ex.load === "BW" ? "var(--muted)" : accentColor }}>{ex.load}</span>
              </td>
              {hasProgression && (
                <td style={tdStyle}>
                  {ex.progression ? (
                    <span className={`prog-chip${ex.progression.startsWith("=") ? " same" : ""}`}>
                      {ex.progression}
                    </span>
                  ) : (
                    <span className="prog-chip same">—</span>
                  )}
                </td>
              )}
              <td style={tdStyle}><RpeBar rpe={ex.rpe} /></td>
              <td style={{ ...tdStyle, fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>{ex.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DayPanel({ day, weekNumber }: { day: IDay; weekNumber: number }) {
  const color = TYPE_COLORS[day.type] ?? "var(--text)";
  const bg = TYPE_BG[day.type] ?? "#111";
  const hasProgression = day.exercises?.some(e => e.progression);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Day header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "56px",
          lineHeight: "1",
          letterSpacing: "2px",
          color,
        }}>
          {day.name}
          {day.optional && (
            <span className="optional-tag">Optional</span>
          )}
        </h2>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)" }}>
          {day.label}
        </span>
        {day.badge && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "4px 12px",
            border: `1px solid ${color}`,
            color,
            borderRadius: "2px",
            background: bg,
          }}>
            {day.badge}
          </span>
        )}
      </div>

      {/* Info box */}
      {day.infoBox && (
        <div style={{
          background: bg,
          border: `1px solid ${color}20`,
          borderLeft: `3px solid ${color}`,
          padding: "14px 20px",
          marginBottom: "28px",
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          letterSpacing: "1px",
          color: `${color}cc`,
          lineHeight: "1.6",
        }}>
          ▸ {day.infoBox}
        </div>
      )}

      {/* Exercises */}
      {day.exercises?.length > 0 && (
        <ExerciseTable
          exercises={day.exercises}
          hasProgression={hasProgression}
          accentColor={color}
        />
      )}

      {/* Swim drills */}
      {day.type === "swim" && day.drills && day.drills.length > 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "8px" }}>
            {day.drills.map((drill, i) => (
              <div key={i} style={{
                background: "var(--surface)",
                border: `1px solid ${drill.highlight ? "var(--swim)" : "var(--border)"}`,
                padding: "20px",
                borderRadius: "2px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "var(--swim)" }} />
                <div style={{ paddingLeft: "8px" }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "20px",
                    letterSpacing: "1px",
                    color: "var(--swim)",
                    marginBottom: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    {drill.name}
                    {(drill.isNewDrill ?? drill.isNew) && (
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "8px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        background: "#1a082a",
                        color: "var(--swim)",
                        border: "1px solid var(--swim)",
                        borderRadius: "2px",
                      }}>New</span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--muted)", marginBottom: "12px" }}>
                    {drill.volume}
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.6" }}>{drill.cue}</div>
                </div>
              </div>
            ))}
          </div>
          {day.sessionNote && (
            <div style={{ marginTop: "24px", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "2px" }}>
              {day.sessionNote}
            </div>
          )}
        </div>
      )}

      {/* Run stats */}
      {day.type === "run" && (
        <div>
          {day.runStats && day.runStats.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {day.runStats.map((stat, i) => (
                <div key={i} style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "24px 20px",
                  borderRadius: "2px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "var(--run)" }} />
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "1px", color: "var(--run)", lineHeight: "1" }}>
                    {stat.value}
                  </div>
                  {stat.sub && (
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>{stat.sub}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {day.runIntervals && day.runIntervals.length > 0 && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                Session Structure
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                {day.runIntervals.map((interval, i) => (
                  <div key={i} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "20px",
                    borderRadius: "2px",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "var(--run)" }} />
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                      {interval.label}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "var(--run)", lineHeight: "1" }}>
                      {interval.value}
                    </div>
                    {interval.sub && (
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{interval.sub}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {day.runNote && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "2px", marginTop: "8px", lineHeight: "1.8" }}>
              {day.runNote}
            </div>
          )}
        </div>
      )}

      {/* MMA */}
      {day.type === "mma" && (
        <div style={{ marginTop: "24px" }}>
          <div style={{
            padding: "32px",
            background: "#1a0a0a",
            border: "1px solid #2a1010",
            borderLeft: "3px solid var(--mma)",
          }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px", color: "var(--mma)", marginBottom: "12px" }}>
              Train. Fight. Log.
            </h3>
            <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.8", whiteSpace: "pre-line" }}>
              {day.mmaNote || "No programming here — this is your fight session. High intensity, full body, unpredictable load.\n\nAfter session, log: energy going in / energy coming out / anything notable."}
            </div>
          </div>
        </div>
      )}

      {/* Rest */}
      {day.type === "rest" && (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "80px", color: "#1e1e1e", letterSpacing: "4px", display: "block", marginBottom: "16px" }}>
            REST
          </span>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase" }}>
            {day.sessionNote || "Full recovery. Walk if you want. Nothing structured."}
          </p>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "9px",
  letterSpacing: "3px",
  textTransform: "uppercase",
  color: "var(--muted)",
  textAlign: "left",
  padding: "0 16px 12px 0",
  borderBottom: "1px solid var(--border)",
  fontWeight: 400,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px 14px 0",
  verticalAlign: "middle",
  lineHeight: "1.5",
};
