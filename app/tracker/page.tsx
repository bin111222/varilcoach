"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, TrendingUp, Calendar as CalendarIcon, Save, Activity, Trophy } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WorkoutSet {
  reps: number;
  weight: number;
  isPR: boolean;
}

interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

interface Workout {
  _id: string;
  date: string;
  exercises: WorkoutExercise[];
}

export default function TrackerPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // New workout form state
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { name: "", sets: [{ reps: 0, weight: 0, isPR: false }] },
  ]);
  const [saving, setSaving] = useState(false);

  // Chart state
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);
      fetchWorkouts(id);
    }
  }, []);

  const fetchWorkouts = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workouts?userId=${uid}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWorkouts(data);
        // Set default selected exercise if not set
        if (!selectedExercise && data.length > 0) {
          const allExNames = data.flatMap(w => w.exercises.map(e => e.name));
          if (allExNames.length > 0) {
            setSelectedExercise(allExNames[0]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch workouts", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ reps: 0, weight: 0, isPR: false }] }]);
  };

  const handleAddSet = (exIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets.push({ reps: 0, weight: 0, isPR: false });
    setExercises(newExercises);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout._id);
    setWorkoutDate(new Date(workout.date).toISOString().split("T")[0]);
    // Format exercises to match state structure
    setExercises(workout.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({
        reps: s.reps,
        weight: s.weight,
        isPR: s.isPR
      }))
    })));
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingWorkoutId(null);
    setWorkoutDate(new Date().toISOString().split("T")[0]);
    setExercises([{ name: "", sets: [{ reps: 0, weight: 0, isPR: false }] }]);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;
    try {
      const res = await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
      if (res.ok && userId) {
        fetchWorkouts(userId);
        if (editingWorkoutId === id) handleCancelEdit();
      }
    } catch (e) {
      console.error("Failed to delete workout", e);
    }
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets.splice(setIndex, 1);
    if (newExercises[exIndex].sets.length === 0) {
      newExercises[exIndex].sets.push({ reps: 0, weight: 0, isPR: false });
    }
    setExercises(newExercises);
  };

  const handleSaveWorkout = async () => {
    if (!userId) return;
    setSaving(true);
    
    // Filter out empty exercises
    const validExercises = exercises.filter(ex => ex.name.trim() !== "");
    if (validExercises.length === 0) {
      alert("Please add at least one exercise");
      setSaving(false);
      return;
    }

    try {
      const url = "/api/workouts";
      const method = editingWorkoutId ? "PUT" : "POST";
      const body = editingWorkoutId 
        ? { id: editingWorkoutId, date: workoutDate, exercises: validExercises }
        : { userId, date: workoutDate, exercises: validExercises };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        setEditingWorkoutId(null);
        setExercises([{ name: "", sets: [{ reps: 0, weight: 0, isPR: false }] }]);
        fetchWorkouts(userId);
      }
    } catch (e) {
      console.error("Failed to save workout", e);
    } finally {
      setSaving(false);
    }
  };

  // Process data for chart
  const chartData = useMemo(() => {
    if (!selectedExercise || workouts.length === 0) return [];

    // Filter exercises by name and sort by date
    const relevantWorkouts = workouts
      .filter(w => w.exercises.some(e => e.name.toLowerCase() === selectedExercise.toLowerCase()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by month
    const monthlyData: Record<string, { weight: number; date: Date }> = {};

    relevantWorkouts.forEach(w => {
      const date = new Date(w.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const ex = w.exercises.find(e => e.name.toLowerCase() === selectedExercise.toLowerCase());
      const maxWeight = Math.max(...(ex?.sets.map(s => s.weight) || [0]));

      if (!monthlyData[monthYear] || maxWeight > monthlyData[monthYear].weight) {
        monthlyData[monthYear] = { weight: maxWeight, date: new Date(date.getFullYear(), date.getMonth(), 1) };
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthYear, data]) => ({
        date: data.date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        weight: data.weight,
        monthYear,
      }));
  }, [workouts, selectedExercise]);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => {
      w.exercises.forEach(e => names.add(e.name));
    });
    return Array.from(names);
  }, [workouts]);

  if (loading && workouts.length === 0) {
    return <div className="loading-screen">Loading Tracker...</div>;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "var(--section-padding) var(--page-pad)" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px", borderBottom: "1px solid var(--border)", paddingBottom: "32px" }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "8px",
        }}>
          Strength Training
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "var(--header-font-size)",
          lineHeight: "0.9",
          letterSpacing: "2px",
        }}>
          WEIGHTLIFTING <span style={{ color: "var(--accent)" }}>TRACKER</span>
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "var(--two-col)", gap: "48px" }}>
        {/* Left: Add Workout */}
        <div>
          <div style={{ 
            background: "var(--surface)", 
            padding: "min(32px, 5vw)", 
            border: "1px solid var(--border)", 
            borderRadius: "4px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "1px" }}>
                {editingWorkoutId ? "EDIT WORKOUT" : "LOG WORKOUT"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CalendarIcon size={16} color="var(--muted)" />
                <input 
                  type="date" 
                  value={workoutDate} 
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: "14px", padding: "4px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {exercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ 
                  border: "1px solid var(--border2)", 
                  padding: "min(20px, 4vw)", 
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.02)"
                }}>
                  <div style={{ marginBottom: "16px" }}>
                    <input
                      placeholder="EXERCISE NAME"
                      value={ex.name}
                      onChange={(e) => {
                        const newEx = [...exercises];
                        newEx[exIdx].name = e.target.value;
                        setExercises(newEx);
                      }}
                      style={{ 
                        width: "100%", 
                        fontFamily: "'DM Mono', monospace", 
                        background: "transparent",
                        fontSize: "16px",
                        borderBottom: "2px solid var(--border2)",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderRadius: 0,
                        padding: "8px 0"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            placeholder="WEIGHT"
                            value={set.weight || ""}
                            onChange={(e) => {
                              const newEx = [...exercises];
                              newEx[exIdx].sets[setIdx].weight = Number(e.target.value);
                              setExercises(newEx);
                            }}
                            style={{ width: "100%", paddingRight: "35px", fontSize: "14px" }}
                          />
                          <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>KG</span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            placeholder="REPS"
                            value={set.reps || ""}
                            onChange={(e) => {
                              const newEx = [...exercises];
                              newEx[exIdx].sets[setIdx].reps = Number(e.target.value);
                              setExercises(newEx);
                            }}
                            style={{ width: "100%", paddingRight: "35px", fontSize: "14px" }}
                          />
                          <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>REPS</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              const newEx = [...exercises];
                              newEx[exIdx].sets[setIdx].isPR = !newEx[exIdx].sets[setIdx].isPR;
                              setExercises(newEx);
                            }}
                            style={{
                              flex: 1,
                              background: set.isPR ? "var(--accent)" : "transparent",
                              color: set.isPR ? "#000" : "var(--muted)",
                              border: `1px solid ${set.isPR ? "var(--accent)" : "var(--border2)"}`,
                              padding: "10px",
                              borderRadius: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s"
                            }}
                            title="Mark as PR"
                          >
                            <Trophy size={14} />
                          </button>
                          <button
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                            style={{ flex: 1, background: "transparent", border: "1px solid var(--border2)", color: "var(--accent3)", padding: "10px", borderRadius: "2px" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddSet(exIdx)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px dashed var(--border2)",
                        color: "var(--muted)",
                        padding: "8px",
                        fontSize: "12px",
                        fontFamily: "'DM Mono', monospace",
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Plus size={14} /> ADD SET
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddExercise}
                style={{
                  background: "transparent",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  padding: "12px",
                  borderRadius: "2px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Plus size={18} /> ADD ANOTHER EXERCISE
              </button>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                {editingWorkoutId && (
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "1px solid var(--border2)",
                      color: "var(--text)",
                      padding: "16px",
                      borderRadius: "2px",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "14px",
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    CANCEL
                  </button>
                )}
                <button
                  onClick={handleSaveWorkout}
                  disabled={saving}
                  style={{
                    flex: 2,
                    background: "var(--accent)",
                    color: "#000",
                    border: "none",
                    padding: "16px",
                    borderRadius: "2px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "16px",
                    fontWeight: 600,
                    letterSpacing: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  <Save size={20} /> {saving ? "SAVING..." : editingWorkoutId ? "UPDATE WORKOUT" : "SAVE WORKOUT"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ 
            background: "var(--surface)", 
            padding: "min(32px, 5vw)", 
            border: "1px solid var(--border)", 
            borderRadius: "4px",
            height: "fit-content"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "1px" }}>
                PROGRESS
              </h2>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{ 
                  background: "var(--bg)", 
                  border: "1px solid var(--border2)", 
                  color: "var(--text)", 
                  padding: "8px 16px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "13px",
                  width: "100%",
                  maxWidth: "200px"
                }}
              >
                <option value="">Select Exercise</option>
                {exerciseNames.map(name => (
                  <option key={name} value={name}>{name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div style={{ height: "400px", width: "100%" }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'KG', angle: -90, position: 'insideLeft', fill: '#888', fontFamily: "'DM Mono', monospace" }}
                    />
                    <Tooltip 
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "4px" }}
                      itemStyle={{ color: "var(--accent)" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="var(--accent)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--accent)", stroke: "var(--accent)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8, stroke: "var(--accent)", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--muted)",
                  border: "1px dashed var(--border2)",
                  borderRadius: "4px",
                  gap: "16px"
                }}>
                  <Activity size={48} opacity={0.2} />
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>
                    {selectedExercise ? "No data for this exercise yet." : "Select an exercise to see progress."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Workouts List */}
          <div style={{ 
            background: "var(--surface)", 
            padding: "32px", 
            border: "1px solid var(--border)", 
            borderRadius: "4px" 
          }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "1px", marginBottom: "24px" }}>
              RECENT LOGS
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {workouts.slice(0, 10).map((w) => (
                <div 
                  key={w._id} 
                  onClick={() => handleEditWorkout(w)}
                  style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "12px",
                    padding: "20px",
                    border: `1px solid ${editingWorkoutId === w._id ? "var(--accent)" : "var(--border2)"}`,
                    background: editingWorkoutId === w._id ? "rgba(var(--accent-rgb), 0.05)" : "rgba(255,255,255,0.01)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (editingWorkoutId !== w._id) {
                      e.currentTarget.style.borderColor = "var(--border2)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                    } else {
                      e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.05)";
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", letterSpacing: "1px" }}>
                      {new Date(w.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(w._id);
                        }}
                        style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent3)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {w.exercises.map((ex, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>
                            {ex.name.toUpperCase()}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                            {ex.sets.length} SETS
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {ex.sets.map((s, si) => (
                            <span key={si} style={{ 
                              fontSize: "12px", 
                              color: "var(--accent)",
                              background: "rgba(var(--accent-rgb), 0.1)",
                              padding: "2px 6px",
                              borderRadius: "2px",
                              fontFamily: "'DM Mono', monospace"
                            }}>
                              {s.weight}×{s.reps}{s.isPR ? '★' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {workouts.length === 0 && (
                <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px", fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>
                  No workouts logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
