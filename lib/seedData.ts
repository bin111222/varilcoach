export const week1Data = {
  number: 1,
  subtitle: "Training Programme — Calisthenics / Swim / Run / MMA",
  priorityStack: [
    "01 — Calisthenics Strength",
    "02 — Swim Technique",
    "03 — Run Maintenance",
    "04 — MMA Ready",
  ],
  bannerItems: [],
  days: [
    {
      id: "mon",
      name: "PULL DAY",
      label: "Monday",
      type: "pull",
      optional: false,
      badge: "Strength Focus",
      infoBox: "",
      exercises: [
        {
          name: "Single Arm Scapular Shrug",
          highlight: false,
          sets: "2 × 8 / side",
          load: "BW",
          loadColor: "",
          rpe: 5,
          notes: "Activation — not fatigue",
        },
        {
          name: "Muscle-Up",
          highlight: true,
          sets: "3 × 2",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Always first. Stop if form breaks.",
        },
        {
          name: "Weighted Pull-Up",
          highlight: false,
          sets: "4 × 4",
          load: "27.5 kg",
          loadColor: "pull",
          rpe: 8,
          notes: "Small jump from 25 kg — test it",
        },
        {
          name: "Weighted Chin-Up",
          highlight: false,
          sets: "3 × 5",
          load: "20 kg",
          loadColor: "pull",
          rpe: 7,
          notes: "Secondary volume",
        },
        {
          name: "Ring Row",
          highlight: false,
          sets: "3 × 8",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Horizontal pull — keep body rigid",
        },
        {
          name: "Hanging Leg Raise",
          highlight: false,
          sets: "3 × 8",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Slow and controlled",
        },
        {
          name: "L-Sit Hold",
          highlight: false,
          sets: "3 × max",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Target 20s per set",
        },
      ],
    },
    {
      id: "tue",
      name: "LEGS",
      label: "Tuesday",
      type: "legs",
      optional: true,
      badge: "Only if fresh",
      infoBox:
        "Skip entirely if legs are heavy. MMA residue or general fatigue = rest day.",
      infoBoxColor: "legs",
      exercises: [
        {
          name: "Box Jump",
          highlight: false,
          sets: "3 × 4",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Power primer — not conditioning",
        },
        {
          name: "Pistol Squat",
          highlight: false,
          sets: "3 × 4 / side",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Add load next week if easy",
        },
        {
          name: "Bulgarian Split Squat",
          highlight: false,
          sets: "3 × 6 / side",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "3 sec eccentric — slow down",
        },
        {
          name: "Nordic Curl",
          highlight: true,
          sets: "3 × 4",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "Hamstring longevity — essential",
        },
        {
          name: "Hollow Body Hold",
          highlight: false,
          sets: "3 × 30s",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Core — always include",
        },
      ],
    },
    {
      id: "wed",
      name: "PUSH DAY",
      label: "Wednesday",
      type: "push",
      optional: false,
      badge: "Strength + Skill",
      infoBox: "",
      exercises: [
        {
          name: "Pike Push-Up",
          highlight: false,
          sets: "2 × 8",
          load: "BW",
          loadColor: "",
          rpe: 5,
          notes: "Warm-up / shoulder prep",
        },
        {
          name: "HSPU (wall) — CALIBRATE",
          highlight: true,
          sets: "3 × max–1",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "Log exact reps — this is calibration",
        },
        {
          name: "Weighted Dip",
          highlight: false,
          sets: "4 × 5",
          load: "27.5 kg",
          loadColor: "push",
          rpe: 8,
          notes: "Test 27.5 kg — drop to 25 if RPE 9+",
        },
        {
          name: "Ring Dip",
          highlight: false,
          sets: "3 × 6",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Stability — slow at bottom",
        },
        {
          name: "Ring Push-Up",
          highlight: false,
          sets: "3 × 8",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Protraction at top",
        },
        {
          name: "Planche Lean",
          highlight: false,
          sets: "3 × 10s",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Skill work — not to failure",
        },
        {
          name: "Ab Wheel",
          highlight: false,
          sets: "3 × 6",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "Full extension — neutral lower back only",
        },
      ],
    },
    {
      id: "thu",
      name: "SWIM",
      label: "Thursday",
      type: "swim",
      optional: false,
      badge: "Technique First",
      infoBox:
        "Theme — Catch Mechanics + Bilateral Breathing | No pace target. No yardage target. Technique only.",
      infoBoxColor: "swim",
      exercises: [],
      drills: [
        {
          name: "Side Kick Drill",
          volume: "4 × 25m",
          cue: "Ear on water — one goggle in, one out. Don't lift the head to breathe. Body rotation drives it.",
        },
        {
          name: "Catch-Up Drill",
          volume: "4 × 25m",
          cue: "Full arm extension before initiating the catch. Don't rush the pull — wait for the lead hand to 'catch up'.",
        },
        {
          name: "Fingertip Drag",
          volume: "4 × 25m",
          cue: "Elbow stays high on recovery — drag fingertips along the surface. Forces correct elbow position.",
        },
        {
          name: "Bilateral Breathing",
          volume: "4 × 50m",
          cue: "Every 3 strokes. Even if it feels wrong. This is the work — stay with it.",
        },
        {
          name: "Full Freestyle",
          volume: "200m easy",
          cue: "No drills — apply what clicked. Relaxed. No pace target. Just feel it.",
        },
      ],
      sessionNote: "TOTAL APPROX — 400m drills + 200m freestyle. Short is fine.",
    },
    {
      id: "fri",
      name: "EASY RUN",
      label: "Friday",
      type: "run",
      optional: false,
      badge: "MMA Buffer",
      infoBox:
        "MMA is tomorrow. Legs must feel loose going in. No intensity today.",
      infoBoxColor: "run",
      exercises: [],
      runStats: [
        { label: "Type", value: "EASY", sub: "Aerobic — conversational" },
        { label: "Duration", value: "30 min", sub: "No more" },
        {
          label: "Target Pace",
          value: "5:20–5:30",
          sub: "per km — below your aerobic pace",
        },
      ],
      runNote: "No tempo. No intervals. No hill work. Loose legs only.",
    },
    {
      id: "sat",
      name: "MMA",
      label: "Saturday",
      type: "mma",
      optional: false,
      badge: "Fixed — Non-negotiable",
      exercises: [],
      mmaNote:
        "No programming here — this is your fight session. High intensity, full body, unpredictable load.\n\nAfter session, log: energy going in / energy coming out / anything notable (injury, intensity, sparring quality).\n\nThis log shapes Monday and Tuesday programming.",
    },
    {
      id: "sun",
      name: "REST",
      label: "Sunday",
      type: "rest",
      optional: false,
      exercises: [],
      sessionNote: "Full recovery. Walk if you want. Nothing structured.",
    },
  ],
  flags: [
    "27.5 kg on pull-up and dip — small jump to test. RPE 9+ = drop back to 25 kg and note it.",
    "HSPU calibration is Wednesday's priority — log exact reps. That number drives the next 4 weeks.",
    "Muscle-ups: 3 sets of 2. If rep 2 grinds, drop to singles next week. Protect the skill.",
    "Swim: short sessions are fine. Technique work doesn't need volume. Quality over laps.",
    "Log every session — after 2–3 weeks the log drives all programming decisions.",
  ],
  warnFlags: [],
};

export const week2Data = {
  number: 2,
  subtitle: "Training Programme — Calisthenics / Swim / Run / MMA",
  priorityStack: [
    "↑ Pull-up → 30 kg",
    "↑ Dip → 30 kg",
    "↑ HSPU → +1 rep",
    "↑ Swim → 6-kick switch added",
    "↑ Run → Tempo introduced",
  ],
  bannerItems: [
    "Week 1 Complete ✓",
    "Pull-up: 25kg → 30kg",
    "Dip: 25kg → 30kg",
    "Muscle-up: 3×2 held — monitoring",
    "HSPU: progressing reps",
    "Swim: new drill added",
    "Run Thu: tempo introduced",
  ],
  days: [
    {
      id: "mon",
      name: "PULL DAY",
      label: "Monday",
      type: "pull",
      optional: false,
      badge: "Load Increase",
      infoBox:
        "Pull-up jumps to 30 kg — significant step. If RPE hits 9 on set 2, drop to 27.5 kg and hold there. Muscle-up stays at 3×2 — watching volume closely.",
      infoBoxColor: "pull",
      exercises: [
        {
          name: "Single Arm Scapular Shrug",
          highlight: false,
          sets: "2 × 8 / side",
          load: "BW",
          loadColor: "",
          rpe: 5,
          notes: "Activation — unchanged",
          progression: "—",
        },
        {
          name: "Muscle-Up",
          highlight: true,
          sets: "3 × 2",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Holding volume — heavier pull-ups follow",
          progression: "= hold",
        },
        {
          name: "Weighted Pull-Up",
          highlight: false,
          sets: "4 × 4",
          load: "30 kg",
          loadColor: "pull",
          rpe: 8,
          notes: "Big jump — bail to 27.5 if RPE 9+",
          progression: "↑ +5kg",
        },
        {
          name: "Weighted Chin-Up",
          highlight: false,
          sets: "3 × 5",
          load: "22.5 kg",
          loadColor: "pull",
          rpe: 7,
          notes: "Secondary volume — controlled",
          progression: "↑ +2.5kg",
        },
        {
          name: "Archer Pull-Up",
          highlight: false,
          sets: "3 × 5 / side",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "One more rep — keep it strict",
          progression: "↑ +1 rep",
        },
        {
          name: "Ring Row",
          highlight: false,
          sets: "3 × 10",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Horizontal volume — add feet elevation",
          progression: "↑ +2 reps",
        },
        {
          name: "Toes-to-Bar",
          highlight: false,
          sets: "3 × 8",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Upgraded from HLR — more range",
          progression: "↑ swap",
        },
        {
          name: "L-Sit Hold",
          highlight: false,
          sets: "3 × max",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Beat W1 time — log each set",
          progression: "= hold",
        },
      ],
    },
    {
      id: "tue",
      name: "LEGS",
      label: "Tuesday",
      type: "legs",
      optional: true,
      badge: "Only if fresh",
      infoBox:
        "Skip if legs are still carrying Saturday MMA. This is longevity work, not a grind. Adding load to Pistol if W1 felt easy.",
      infoBoxColor: "legs",
      exercises: [
        {
          name: "Box Jump",
          highlight: false,
          sets: "4 × 4",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Power — full reset between reps",
          progression: "↑ +1 set",
        },
        {
          name: "Pistol Squat",
          highlight: false,
          sets: "3 × 5 / side",
          load: "+5 kg DB",
          loadColor: "legs",
          rpe: 7,
          notes: "W1 felt easy — add load now",
          progression: "↑ load",
        },
        {
          name: "Bulgarian Split Squat",
          highlight: false,
          sets: "3 × 7 / side",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "3 sec eccentric — keep it slow",
          progression: "↑ +1 rep",
        },
        {
          name: "Nordic Curl",
          highlight: true,
          sets: "3 × 5",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "Hamstring protection — non-negotiable",
          progression: "↑ +1 rep",
        },
        {
          name: "Shrimp Squat",
          highlight: false,
          sets: "3 × 4 / side",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Added W2 — quad depth + balance",
          progression: "↑ new",
        },
        {
          name: "Hollow Body Hold",
          highlight: false,
          sets: "3 × 35s",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "5 more seconds — brace harder",
          progression: "↑ +5s",
        },
      ],
    },
    {
      id: "wed",
      name: "PUSH DAY",
      label: "Wednesday",
      type: "push",
      optional: false,
      badge: "Load Increase + HSPU Progress",
      infoBox:
        "Dip moves to 30 kg. HSPU — add 1 rep per set to W1 calibration. Planche lean holds at 10s but increase focus on forward lean angle.",
      infoBoxColor: "push",
      exercises: [
        {
          name: "Pike Push-Up",
          highlight: false,
          sets: "2 × 10",
          load: "BW",
          loadColor: "",
          rpe: 5,
          notes: "Warm-up — slightly longer",
          progression: "↑ +2 reps",
        },
        {
          name: "HSPU (wall)",
          highlight: true,
          sets: "3 × W1+1",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "One rep added to each set — full ROM only",
          progression: "↑ +1 rep",
        },
        {
          name: "Weighted Dip",
          highlight: false,
          sets: "4 × 5",
          load: "30 kg",
          loadColor: "push",
          rpe: 8,
          notes: "Big jump — slow eccentric (2 sec down)",
          progression: "↑ +5kg",
        },
        {
          name: "Ring Dip",
          highlight: false,
          sets: "3 × 7",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Stability emphasis — pause at bottom",
          progression: "↑ +1 rep",
        },
        {
          name: "Ring Push-Up",
          highlight: false,
          sets: "3 × 10",
          load: "BW",
          loadColor: "",
          rpe: 7,
          notes: "Protract hard at top",
          progression: "↑ +2 reps",
        },
        {
          name: "Planche Lean",
          highlight: false,
          sets: "4 × 10s",
          load: "BW",
          loadColor: "",
          rpe: 6,
          notes: "Extra set — push lean angle further",
          progression: "↑ +1 set",
        },
        {
          name: "Ab Wheel",
          highlight: false,
          sets: "3 × 8",
          load: "BW",
          loadColor: "",
          rpe: 8,
          notes: "Full extension — neutral spine non-negotiable",
          progression: "↑ +2 reps",
        },
      ],
    },
    {
      id: "thu",
      name: "TEMPO RUN",
      label: "Thursday",
      type: "run",
      optional: false,
      badge: "Upgrade from Easy",
      infoBox:
        "Week 1 was easy runs only. W2 Thursday introduces tempo effort — controlled discomfort, not a sprint. Swim moves to Friday only.",
      infoBoxColor: "run",
      exercises: [],
      runStats: [
        { label: "Total Duration", value: "40 min", sub: "~7–8 km total" },
      ],
      runIntervals: [
        { label: "Warm-Up", value: "10 min", sub: "Easy @ 5:20–5:30/km" },
        {
          label: "Tempo Block",
          value: "20 min",
          sub: "Continuous @ 4:30–4:40/km",
        },
        { label: "Cool Down", value: "10 min", sub: "Easy @ 5:20–5:30/km" },
        { label: "Total Duration", value: "40 min", sub: "~7–8 km total" },
      ],
      runNote:
        "Tempo pace = controlled discomfort. You can speak but only in short sentences. If you're fully comfortable, push slightly. If you're gasping, ease back.",
    },
    {
      id: "fri",
      name: "SWIM",
      label: "Friday",
      type: "swim",
      optional: false,
      badge: "New Drill Added",
      infoBox:
        "Theme — Pull Timing + Kick Coordination | W1 drills re-run first, then 6-kick switch introduced. Technique only — no pace, no ego.",
      infoBoxColor: "swim",
      exercises: [],
      drills: [
        {
          name: "Catch-Up Drill",
          volume: "3 × 25m — review",
          cue: "W1 drill — run it again but now focus on the catch pressure. Feel the water load on your forearm before pulling.",
        },
        {
          name: "Fingertip Drag",
          volume: "3 × 25m — review",
          cue: "Elbow stays high. This should now feel more natural than W1. If it doesn't, slow down and feel it.",
        },
        {
          name: "6-Kick Switch",
          volume: "4 × 25m",
          cue: "6 kicks on each side before switching arms. Forces balance and rotation. Kick from the hip — not the knee. Don't rush the switch.",
          isNew: true,
          highlight: true,
        },
        {
          name: "Pull Buoy Sets",
          volume: "4 × 50m",
          cue: "Legs off — focus entirely on arm stroke. Feel the catch-pull-push cycle. Breathe bilaterally. Long, patient strokes.",
        },
        {
          name: "Full Freestyle",
          volume: "200m easy",
          cue: "Apply everything. Relaxed. No pace target. Focus on one thing at a time — rotation, then catch, then kick.",
        },
      ],
      sessionNote:
        "Total approx — 350m drills + 200m pull buoy + 200m freestyle. Technique over yardage.",
    },
    {
      id: "sat",
      name: "MMA",
      label: "Saturday",
      type: "mma",
      optional: false,
      badge: "Fixed — Non-negotiable",
      exercises: [],
      mmaNote:
        "No programming here. High intensity, unpredictable load, full body.\n\nLog after: energy in / energy out / intensity / anything notable. W3 programming adjusts based on how Saturdays are accumulating.\n\nTwo weeks of MMA data incoming — this starts shaping the week structure.",
    },
    {
      id: "sun",
      name: "REST",
      label: "Sunday",
      type: "rest",
      optional: false,
      exercises: [],
      sessionNote:
        "Full recovery. Walk if you want. Nothing structured. Week 2 is heavier. Sunday earns its keep.",
    },
  ],
  flags: [
    "Pull-up at 30 kg is a meaningful jump from 25 kg. If you hit RPE 9 on set 2, scale back to 27.5 kg — don't grind through it.",
    "Dip at 30 kg — slow the eccentric to 2 seconds. This protects the shoulder and builds more strength than rushing it.",
    "HSPU: add exactly 1 rep per set to your W1 numbers. No more. Log them.",
    "6-kick switch is the new swim drill — it's supposed to feel awkward. That's the point. Don't rush the switch.",
    "Thursday tempo is new — stay disciplined on pace. 4:30–4:40/km, not faster. The goal is aerobic development, not a time trial.",
  ],
  warnFlags: [
    "Muscle-up volume stays at 3×2. The load increase on pull-ups means less in the tank — do not push muscle-up volume this week.",
  ],
};

type AnyWeek = typeof week1Data;

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundToNearest(n: number, step: number) {
  return Math.round(n / step) * step;
}

function parseKg(load: string): number | null {
  const m = load.match(/(-?\d+(\.\d+)?)\s*kg/i);
  if (!m) return null;
  return Number(m[1]);
}

function formatKg(kg: number) {
  const v = Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
  return `${v} kg`;
}

function weekPhaseMultiplier(weekNumber: number) {
  // Mild progression with periodic lighter weeks to keep it sustainable.
  // 1–4 build, 5 deload, 6–8 build, 9 deload, 10–12 build, 13 deload, 14–16 build.
  if ([5, 9, 13].includes(weekNumber)) return 0.85;
  return 1.0;
}

function addProgressionChip(prev: string | undefined, next: string) {
  if (prev === next) return "= hold";
  return "↑";
}

function adjustExerciseLoad(ex: any, weekNumber: number, baseWeekNumber: number) {
  const load = String(ex.load ?? "");
  const kg = parseKg(load);
  if (kg == null) return ex;

  const deltaWeeks = Math.max(0, weekNumber - baseWeekNumber);

  // Mild ramp: +2.5kg every 2 weeks, deload weeks scale down.
  const rawInc = (deltaWeeks / 2) * 2.5;
  const phase = weekPhaseMultiplier(weekNumber);
  const nextKg = roundToNearest((kg + rawInc) * phase, 2.5);

  ex.load = formatKg(nextKg);
  ex.progression = addProgressionChip(ex.progression, ex.load);
  return ex;
}

function tweakSetsString(sets: string, weekNumber: number) {
  // Very light touch: every 3 weeks, add +1 rep to common patterns (keeps it "mild").
  if (weekNumber % 3 !== 0) return sets;
  return sets
    .replace(/(\d+)\s*×\s*(\d+)(\s*\/\s*side)?/g, (_m, a, b, side) => {
      const setsN = Number(a);
      const repsN = Number(b);
      const nextReps = clamp(repsN + 1, 1, 20);
      return `${setsN} × ${nextReps}${side ?? ""}`;
    })
    .replace(/(\d+)\s*×\s*max–1/gi, "3 × max–1"); // stable
}

function generateWeekFromBase(base: AnyWeek, weekNumber: number, baseWeekNumber: number) {
  const w = deepClone(base) as any;
  w.number = weekNumber;

  // Keep subtitle consistent; refresh banners/priority for the new week.
  w.subtitle = base.subtitle;
  w.bannerItems = [
    `Week ${weekNumber - 1} Complete ✓`,
    "Mild progression — small wins, no grinding",
    [5, 9, 13].includes(weekNumber) ? "Deload week — quality + recovery" : "Build week — add a little",
  ];

  const phase = weekPhaseMultiplier(weekNumber);
  const isDeload = phase < 1;

  w.priorityStack = [
    "01 — Calisthenics Strength",
    "02 — Swim Technique",
    "03 — Run Maintenance / Tempo",
    "04 — MMA Ready",
  ];
  if (isDeload) {
    w.priorityStack.unshift("↑ Recovery / Technique Priority");
  }

  w.flags = [
    "Progress is mild by design: add a little or hold if form degrades.",
    "If any main lift hits RPE 9+, hold load next week and keep reps crisp.",
    isDeload
      ? "Deload: keep intensity moderate, reduce fatigue, perfect technique."
      : "Build: small increases only — aim for repeatable quality.",
  ];
  w.warnFlags = isDeload
    ? ["This is a lighter week. Resist the urge to 'make up' volume."]
    : [];

  for (const day of w.days ?? []) {
    // Keep day IDs/types stable; only tweak content.
    if (day.exercises?.length) {
      for (const ex of day.exercises) {
        ex.sets = tweakSetsString(String(ex.sets ?? ""), weekNumber);
        adjustExerciseLoad(ex, weekNumber, baseWeekNumber);
      }
    }

    if (day.type === "run") {
      // Run progression: gently extend total duration every 2 weeks; deload trims.
      const baseTotal = 40;
      const deltaWeeks = Math.max(0, weekNumber - baseWeekNumber);
      const inc = Math.floor(deltaWeeks / 2) * 2; // +2 min every 2 weeks
      const total = clamp(Math.round((baseTotal + inc) * phase), 30, 55);

      day.runStats = [{ label: "Total Duration", value: `${total} min`, sub: "" }];
      day.runIntervals = [
        { label: "Warm-Up", value: `${clamp(Math.round(10 * phase), 8, 12)} min`, sub: "Easy" },
        {
          label: "Main",
          value: `${clamp(Math.round((total - 20) * phase), 12, 30)} min`,
          sub: weekNumber < 3 ? "Easy aerobic" : "Tempo / steady (controlled)",
        },
        { label: "Cool Down", value: `${clamp(Math.round(10 * phase), 8, 12)} min`, sub: "Easy" },
      ];
      day.runNote = isDeload
        ? "Deload: keep it easy-steady. No hero pace."
        : "Controlled effort. If breathing is ragged, back off and keep it smooth.";
    }

    if (day.type === "swim") {
      // Swim stays technique-first; gently increase drill volume on build weeks.
      const deltaWeeks = Math.max(0, weekNumber - baseWeekNumber);
      const repsAdd = isDeload ? 0 : Math.floor(deltaWeeks / 4); // +1 rep block every 4 weeks
      if (Array.isArray(day.drills)) {
        day.drills = day.drills.map((d: any) => {
          const v = String(d.volume ?? "");
          const m = v.match(/(\d+)\s*×\s*(\d+)\s*m/i);
          if (!m) return d;
          const sets = Number(m[1]);
          const dist = Number(m[2]);
          const nextSets = clamp(sets + repsAdd, 2, 10);
          d.volume = `${nextSets} × ${dist}m`;
          return d;
        });
      }
      day.sessionNote = isDeload
        ? "Technique-only deload: short, crisp drills. Stop before form fades."
        : day.sessionNote;
    }

    if (day.type === "mma") {
      day.mmaNote =
        "Train as normal. After session, log: energy in/out, sparring intensity, any aches. This log shapes the next week.";
    }
  }

  return w as AnyWeek;
}

export function generateWeeks16() {
  const weeks: AnyWeek[] = [];
  weeks.push(deepClone(week1Data) as AnyWeek);
  weeks.push(deepClone(week2Data) as AnyWeek);

  for (let n = 3; n <= 16; n++) {
    // Use Week 2 as the stable template and gently progress from it.
    weeks.push(generateWeekFromBase(week2Data as AnyWeek, n, 2));
  }

  return weeks;
}

export type SeedProgressLog = {
  date: Date;
  weekNumber: number;
  dayId: string;
  dayName: string;
  sessionType: string;
  energyIn: number;
  energyOut: number;
  exercises: Array<{
    exerciseName: string;
    sets: Array<{ reps: string; weight: string; rpe?: number }>;
    notes: string;
  }>;
  sessionNotes: string;
  mmaLog?: string;
};

function makeSetLogsFromPrescription(prescription: string, load: string) {
  // Accepts strings like "4 × 4", "3 × 5 / side", "3 × max", "3 × W1+1" etc.
  const m = prescription.match(/(\d+)\s*×\s*(\d+)/);
  const setsN = m ? clamp(Number(m[1]), 1, 8) : 3;
  const reps = m ? String(clamp(Number(m[2]), 1, 20)) : "—";
  const weight = load === "BW" ? "BW" : load;
  return Array.from({ length: setsN }, (_, i) => ({
    reps,
    weight,
    rpe: clamp(6 + (i % 3), 6, 9),
  }));
}

export function generateProgressLogsForWeeks(
  weeks: AnyWeek[],
  opts?: { endDate?: Date }
) {
  const endDate = opts?.endDate ?? new Date();
  const logs: SeedProgressLog[] = [];

  // Spread across the last N weeks, oldest first.
  const totalWeeks = weeks.length;
  const msPerDay = 24 * 60 * 60 * 1000;

  for (let i = 0; i < totalWeeks; i++) {
    const w = weeks[i] as any;
    const weekNumber = Number(w.number);

    const weekStart = new Date(endDate.getTime() - (totalWeeks - 1 - i) * 7 * msPerDay);
    weekStart.setHours(18, 0, 0, 0);

    const dayOrder = ["mon", "wed", "thu", "fri", "sat"]; // keep it realistic and not too spammy
    const dayOffsets: Record<string, number> = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

    for (const dayId of dayOrder) {
      const day = (w.days ?? []).find((d: any) => d.id === dayId);
      if (!day) continue;

      const date = new Date(weekStart.getTime() + (dayOffsets[dayId] ?? 0) * msPerDay);
      const energyIn = clamp(6 + ((weekNumber + (dayOffsets[dayId] ?? 0)) % 3) - (weekNumber % 5 === 0 ? 1 : 0), 4, 9);
      const energyOut = clamp(5 + ((weekNumber + (dayOffsets[dayId] ?? 0) + 1) % 4) - (weekNumber % 5 === 0 ? 0 : -1), 4, 10);

      const exercises =
        Array.isArray(day.exercises) && day.exercises.length
          ? day.exercises
              .filter((ex: any) => !ex.optional)
              .slice(0, 4)
              .map((ex: any) => ({
                exerciseName: ex.name,
                sets: makeSetLogsFromPrescription(String(ex.sets ?? ""), String(ex.load ?? "BW")),
                notes: ex.highlight ? "Felt strong. Kept form strict." : "",
              }))
          : [];

      const sessionNotes = (() => {
        if (day.type === "run") return "Smooth, controlled. Focused on relaxed breathing and consistent rhythm.";
        if (day.type === "swim") return "Technique focus: long body line, patient catch, bilateral breathing.";
        if (day.type === "mma") return "Hard rounds. Stayed composed and tracked fatigue.";
        if (day.type === "pull") return "Main work felt crisp. Stopped short of grind reps.";
        if (day.type === "push") return "Shoulders felt good. Maintained control and full ROM.";
        return "Solid session.";
      })();

      logs.push({
        date,
        weekNumber,
        dayId: day.id,
        dayName: day.name,
        sessionType: day.type,
        energyIn,
        energyOut,
        exercises,
        sessionNotes,
        mmaLog: day.type === "mma" ? "Sparring: moderate. No injuries. Good cardio." : "",
      });
    }
  }

  // Newest first for the dashboard slice(0,5)
  logs.sort((a, b) => b.date.getTime() - a.date.getTime());
  return logs;
}
