"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  username: string;
  password?: string;
  athleteName: string;
  goals: string;
  injuries: string;
  experience: string;
  daysPerWeek: string;
  focus: string[];
  units: "kg" | "lbs";
  maxPullups: string;
  maxDips: string;
  maxPushups: string;
  runPace: string;
  numWeeks: string;
  useCustomSchedule: boolean;
  customSchedule: Record<string, string>;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    athleteName: "",
    goals: "",
    injuries: "",
    experience: "Intermediate",
    daysPerWeek: "4",
    focus: ["Calisthenics"],
    units: "kg",
    maxPullups: "",
    maxDips: "",
    maxPushups: "",
    runPace: "",
    numWeeks: "4",
    useCustomSchedule: false,
    customSchedule: {
      mon: "pull",
      tue: "legs",
      wed: "push",
      thu: "swim",
      fri: "run",
      sat: "mma",
      sun: "rest",
    },
  });

  const router = useRouter();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleFocus = (f: string) => {
    setFormData(prev => ({
      ...prev,
      focus: prev.focus.includes(f)
        ? prev.focus.filter(item => item !== f)
        : [...prev.focus, f]
    }));
  };

  async function handleSubmit() {
    setLoading(true);
    setLoadingProgress(10);
    setError("");

    try {
      // 1. Register user
      setLoadingProgress(20);
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const regData = await regRes.json();
      if (regData.error) {
        setError(regData.error);
        setLoading(false);
        setLoadingProgress(0);
        return;
      }

      const userId = regData.userId;
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", formData.username);

      // 2. Save settings
      setLoadingProgress(40);
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          athleteName: formData.athleteName,
          goals: formData.goals.split(",").map(g => g.trim()),
          injuries: formData.injuries,
          units: formData.units,
          programName: formData.focus.join(" / ")
        }),
      });

      // 3. Generate Program using AI
      setLoadingProgress(60);
      // Simulate slow progress for AI generation
      const interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 5, 95));
      }, 1000);

      const genRes = await fetch("/api/onboarding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      });
      
      clearInterval(interval);
      setLoadingProgress(100);
      
      const genData = await genRes.json();
      
      if (genData.error) {
        setError(genData.error);
        setLoading(false);
        setLoadingProgress(0);
      } else {
        setTimeout(() => window.location.href = "/", 500);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setLoadingProgress(0);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        background: "#121212",
        border: "1px solid var(--border)",
        padding: "48px",
        borderRadius: "4px",
        position: "relative"
      }}>
        {/* Progress bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "#1e1e1e"
        }}>
          <div style={{
            height: "100%",
            width: `${(step / 4) * 100}%`,
            background: "var(--accent)",
            transition: "width 0.3s ease"
          }} />
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "var(--header-font-size)",
          letterSpacing: "2px",
          marginBottom: "32px",
          color: "var(--text)",
          lineHeight: "0.9"
        }}>
          ONBOARDING <br /> <span style={{ color: "var(--accent)" }}>STEP {step}</span>
        </h1>

        {error && (
          <div style={{
            background: "rgba(200, 50, 50, 0.1)",
            border: "1px solid var(--run)",
            padding: "12px",
            color: "var(--run)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "14px",
            marginBottom: "24px"
          }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input
                style={inputStyle}
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Unique profile handle"
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Secure your profile"
              />
            </div>
            <div>
              <label style={labelStyle}>Athlete Name</label>
              <input
                style={inputStyle}
                value={formData.athleteName}
                onChange={e => setFormData({ ...formData, athleteName: e.target.value })}
                placeholder="What should I call you?"
              />
            </div>
            <button style={buttonStyle} onClick={nextStep} disabled={!formData.username || !formData.athleteName || !formData.password}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={labelStyle}>Primary Goals</label>
              <textarea
                style={inputStyle}
                rows={3}
                value={formData.goals}
                onChange={e => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g. 10 Muscle-ups, Sub-20min 5k, etc."
              />
            </div>
            <div>
              <label style={labelStyle}>Injuries or Limitations</label>
              <textarea
                style={inputStyle}
                rows={2}
                value={formData.injuries}
                onChange={e => setFormData({ ...formData, injuries: e.target.value })}
                placeholder="e.g. Left shoulder impingement, weak ankles..."
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={secondaryButtonStyle} onClick={prevStep}>Back</button>
              <button style={buttonStyle} onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={labelStyle}>Training Focus (Select all that apply)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {["Calisthenics", "MMA", "Swimming", "Running", "Powerlifting"].map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFocus(f)}
                    style={{
                      padding: "12px",
                      background: formData.focus.includes(f) ? "var(--accent)" : "#1a1a1a",
                      color: formData.focus.includes(f) ? "#000" : "var(--muted)",
                      border: "1px solid var(--border)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Days Per Week</label>
              <select
                style={inputStyle}
                value={formData.daysPerWeek}
                onChange={e => setFormData({ ...formData, daysPerWeek: e.target.value })}
              >
                {[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Days</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Program Length (Weeks)</label>
              <select
                style={inputStyle}
                value={formData.numWeeks}
                onChange={e => setFormData({ ...formData, numWeeks: e.target.value })}
              >
                {[4, 8, 12, 16].map(n => <option key={n} value={n}>{n} Weeks</option>)}
              </select>
            </div>

            <div style={{ marginTop: "12px" }}>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.useCustomSchedule}
                  onChange={e => setFormData({ ...formData, useCustomSchedule: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--accent)" }}
                />
                CUSTOM WORKOUT SCHEDULE
              </label>
              {formData.useCustomSchedule && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", background: "#1a1a1a", padding: "16px", borderRadius: "4px" }}>
                  {[
                    { id: "mon", label: "Monday" },
                    { id: "tue", label: "Tuesday" },
                    { id: "wed", label: "Wednesday" },
                    { id: "thu", label: "Thursday" },
                    { id: "fri", label: "Friday" },
                    { id: "sat", label: "Saturday" },
                    { id: "sun", label: "Sunday" },
                  ].map(day => (
                    <div key={day.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", width: "80px" }}>{day.label}</span>
                      <select
                        style={{ ...inputStyle, padding: "4px 8px", width: "120px", fontSize: "12px" }}
                        value={formData.customSchedule[day.id]}
                        onChange={e => setFormData({
                          ...formData,
                          customSchedule: { ...formData.customSchedule, [day.id]: e.target.value }
                        })}
                      >
                        <option value="pull">PULL</option>
                        <option value="push">PUSH</option>
                        <option value="legs">LEGS</option>
                        <option value="swim">SWIM</option>
                        <option value="run">RUN</option>
                        <option value="mma">MMA</option>
                        <option value="rest">REST</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={secondaryButtonStyle} onClick={prevStep}>Back</button>
              <button style={buttonStyle} onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "24px",
                  letterSpacing: "2px",
                  color: "var(--accent)",
                  marginBottom: "24px"
                }}>
                  ARCHITECTING YOUR PROGRAM...
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    width: `${loadingProgress}%`,
                    height: "100%",
                    background: "var(--accent)",
                    transition: "width 0.4s ease-out",
                    boxShadow: "0 0 10px var(--accent)"
                  }} />
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "12px",
                  color: "var(--muted)",
                  letterSpacing: "1px"
                }}>
                  {loadingProgress < 30 && "Registering your profile..."}
                  {loadingProgress >= 30 && loadingProgress < 60 && "Optimizing stats and goals..."}
                  {loadingProgress >= 60 && loadingProgress < 90 && "AI Coach is drafting your first week..."}
                  {loadingProgress >= 90 && loadingProgress < 100 && "Finalizing drills and progressions..."}
                  {loadingProgress === 100 && "Ready! Taking you to your dashboard..."}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", marginBottom: "10px" }}>
                  To calibrate your first week, please provide current max efforts:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Max Pull-ups</label>
                    <input style={inputStyle} type="number" value={formData.maxPullups} onChange={e => setFormData({ ...formData, maxPullups: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Dips</label>
                    <input style={inputStyle} type="number" value={formData.maxDips} onChange={e => setFormData({ ...formData, maxDips: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Push-ups</label>
                    <input style={inputStyle} type="number" value={formData.maxPushups} onChange={e => setFormData({ ...formData, maxPushups: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>5km Pace (min/km)</label>
                    <input style={inputStyle} value={formData.runPace} onChange={e => setFormData({ ...formData, runPace: e.target.value })} placeholder="e.g. 5:00" />
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <label style={labelStyle}>Preferred Units</label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["kg", "lbs"].map(u => (
                      <button
                        key={u}
                        onClick={() => setFormData({ ...formData, units: u as any })}
                        style={{
                          padding: "8px 20px",
                          background: formData.units === u ? "var(--accent)" : "#1a1a1a",
                          color: formData.units === u ? "#000" : "var(--muted)",
                          border: "1px solid var(--border)",
                          fontFamily: "'DM Mono', monospace"
                        }}
                      >{u.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button style={secondaryButtonStyle} onClick={prevStep} disabled={loading}>Back</button>
                  <button style={buttonStyle} onClick={handleSubmit} disabled={loading}>
                    {loading ? "Generating Program..." : "Finish Onboarding"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'DM Mono', monospace",
  fontSize: "14px",
  color: "var(--muted)",
  marginBottom: "10px",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#1a1a1a",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "'DM Mono', monospace",
  borderRadius: "2px"
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--accent)",
  color: "#000",
  border: "none",
  padding: "16px",
  borderRadius: "2px",
  fontFamily: "'DM Mono', monospace",
  fontSize: "16px",
  fontWeight: "600",
  letterSpacing: "2px",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "opacity 0.2s"
};

const secondaryButtonStyle: React.CSSProperties = {
  width: "120px",
  background: "transparent",
  color: "var(--muted)",
  border: "1px solid var(--border)",
  padding: "16px",
  borderRadius: "2px",
  fontFamily: "'DM Mono', monospace",
  fontSize: "16px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  cursor: "pointer"
};
