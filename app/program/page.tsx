"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DayPanel from "@/components/DayPanel";

const TYPE_COLORS: Record<string, string> = {
  pull: "var(--pull)",
  push: "var(--push)",
  run: "var(--run)",
  swim: "var(--swim)",
  mma: "var(--mma)",
  rest: "var(--rest)",
  legs: "var(--legs)",
};

function ProgramContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [activeDayId, setActiveDayId] = useState("mon");
  const [loading, setLoading] = useState(true);

  const weekParam = searchParams.get("week");
  const dayParam = searchParams.get("day");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`/api/weeks?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWeeks(data);
          const targetNum = weekParam ? Number(weekParam) : data[0].number;
          const found = data.find((w: any) => w.number === targetNum) ?? data[0];
          setCurrentWeek(found);
          setActiveDayId(dayParam ?? found.days[0]?.id ?? "mon");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [weekParam, dayParam]);

  async function handleSeed() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setLoading(true);
    await fetch("/api/seed", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    window.location.reload();
  }

  function switchWeek(num: number) {
    const found = weeks.find(w => w.number === num);
    if (found) {
      setCurrentWeek(found);
      setActiveDayId(found.days[0]?.id ?? "mon");
      router.push(`/program?week=${num}`);
    }
  }

  function switchDay(id: string) {
    setActiveDayId(id);
    if (currentWeek) {
      router.push(`/program?week=${currentWeek.number}&day=${id}`);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 56px)", color: "var(--muted)", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
        LOADING...
      </div>
    );
  }

  if (!currentWeek) {
    return (
      <div style={{ padding: "60px 48px", fontFamily: "'DM Mono', monospace", color: "var(--muted)" }}>
        No programme found.{" "}
        <button 
          onClick={handleSeed} 
          style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "underline" }}
        >
          Seed data
        </button>
      </div>
    );
  }

  const activeDay = currentWeek.days?.find((d: any) => d.id === activeDayId) ?? currentWeek.days?.[0];
  const activeDayColor = activeDay ? TYPE_COLORS[activeDay.type] ?? "var(--text)" : "var(--text)";

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "var(--section-padding) var(--page-pad) 40px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        position: "relative",
        overflow: "hidden",
        flexWrap: "wrap",
        gap: "20px",
      }}>
        {/* Big watermark */}
        <div style={{
          position: "absolute",
          right: "-20px",
          top: "-30px",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(120px, 20vw, 280px)",
          color: "#ffffff04",
          lineHeight: "1",
          pointerEvents: "none",
          letterSpacing: "-10px",
          userSelect: "none",
        }}>
          W{currentWeek.number}
        </div>

        <div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "var(--header-font-size)",
            lineHeight: "0.9",
            letterSpacing: "2px",
          }}>
            WEEK <span style={{ color: "var(--accent)" }}>
              {String(currentWeek.number).padStart(2, "0")}
            </span>
          </h1>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginTop: "14px" }}>
            {currentWeek.subtitle}
          </div>
        </div>

        <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--muted)", letterSpacing: "1px", position: "relative", zIndex: 1, flex: "1 1 200px" }}>
          <div style={{ color: "var(--accent)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
            {currentWeek.number === 2 ? "Week 2 Adjustments" : "Priority Stack"}
          </div>
          {currentWeek.priorityStack?.map((item: string, i: number) => (
            <p key={i} style={{ marginBottom: "2px" }}>{item}</p>
          ))}
        </div>
      </div>

      {/* Week 2 banner */}
      {currentWeek.bannerItems?.length > 0 && (
        <div style={{
          background: "linear-gradient(90deg, #0e1a00, #0a0a0a)",
          borderBottom: "1px solid var(--border)",
          padding: "12px var(--page-pad)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          letterSpacing: "2px",
          color: "var(--accent)",
          textTransform: "uppercase",
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
        }}>
          {currentWeek.bannerItems.map((item: string, i: number) => (
            <div key={i}>{item}</div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: "24px", padding: "16px var(--page-pad)", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== "rest").map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
            {type}
          </div>
        ))}
      </div>

      {/* Week selector */}
      <div style={{ display: "flex", gap: "8px", padding: "16px var(--page-pad)", borderBottom: "1px solid var(--border)", alignItems: "center", overflowX: "auto" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginRight: "8px", flexShrink: 0 }}>
          Weeks:
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {weeks.map(w => (
            <button
              key={w.number}
              onClick={() => switchWeek(w.number)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                letterSpacing: "2px",
                padding: "4px 12px",
                border: "1px solid " + (currentWeek.number === w.number ? "var(--accent)" : "var(--border2)"),
                background: currentWeek.number === w.number ? "rgba(200,245,66,0.06)" : "transparent",
                color: currentWeek.number === w.number ? "var(--accent)" : "var(--muted)",
                borderRadius: "2px",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              W{w.number}
            </button>
          ))}
        </div>
        <Link
          href="/admin"
          style={{
            marginLeft: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--muted)",
            border: "1px solid var(--border2)",
            padding: "4px 10px",
            borderRadius: "2px",
            flexShrink: 0
          }}
        >
          Edit →
        </Link>
      </div>

      {/* Day tabs */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        minWidth: "100%",
        WebkitOverflowScrolling: "touch"
      }}>
        {currentWeek.days?.map((day: any) => {
          const isActive = day.id === activeDayId;
          const color = TYPE_COLORS[day.type] ?? "var(--rest)";
          return (
            <button
              key={day.id}
              onClick={() => switchDay(day.id)}
              style={{
                padding: "20px 16px",
                background: isActive ? "var(--surface)" : "transparent",
                position: "relative",
                cursor: "pointer",
                border: "none",
                borderRight: "1px solid var(--border)",
                textAlign: "left",
                color,
                transition: "background 0.15s",
                minWidth: "80px"
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", background: color }} />
              )}
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "1px", display: "block" }}>
                {day.id.toUpperCase().slice(0, 3)}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "4px", display: "block", color: isActive ? color : "var(--muted)" }}>
                {day.type}{day.optional ? "?" : ""}
              </span>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, marginTop: "10px" }} />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: "0 var(--page-pad) 60px" }}>
        {activeDay && (
          <div style={{ paddingTop: "40px" }}>
            <DayPanel day={activeDay} weekNumber={currentWeek.number} />
          </div>
        )}

        {/* Flags */}
        {(currentWeek.flags?.length > 0 || currentWeek.warnFlags?.length > 0) && (
          <div style={{ marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
            <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
              ⚑ Week {currentWeek.number} Flags
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentWeek.warnFlags?.map((flag: string, i: number) => (
                <div key={`w${i}`} style={{ display: "flex", gap: "14px", fontSize: "13px", color: "#aaa", lineHeight: "1.5" }}>
                  <span style={{ color: "var(--run)", flexShrink: 0, marginTop: "1px" }}>▸</span>
                  {flag}
                </div>
              ))}
              {currentWeek.flags?.map((flag: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "14px", fontSize: "13px", color: "#aaa", lineHeight: "1.5" }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "1px" }}>▸</span>
                  {flag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramPage() {
  return (
    <Suspense>
      <ProgramContent />
    </Suspense>
  );
}
