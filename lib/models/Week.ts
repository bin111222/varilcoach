import mongoose, { Schema, model, models } from "mongoose";

export interface IExercise {
  name: string;
  highlight: boolean;
  sets: string;
  load: string;
  loadColor: string;
  rpe: number;
  notes: string;
  progression?: string;
  optional?: boolean;
}

export interface IDrill {
  name: string;
  volume: string;
  cue: string;
  isNew?: boolean;
  isNewDrill?: boolean;
  highlight?: boolean;
}

export interface IRunInterval {
  label: string;
  value: string;
  sub: string;
}

export interface IDay {
  id: string;
  name: string;
  label: string;
  type: "pull" | "push" | "legs" | "swim" | "run" | "mma" | "rest";
  optional: boolean;
  badge?: string;
  infoBox?: string;
  infoBoxColor?: string;
  exercises: IExercise[];
  drills?: IDrill[];
  runStats?: IRunInterval[];
  runIntervals?: IRunInterval[];
  runNote?: string;
  mmaNote?: string;
  sessionNote?: string;
}

export interface IWeek {
  _id: string;
  number: number;
  subtitle: string;
  priorityStack: string[];
  bannerItems: string[];
  days: IDay[];
  flags: string[];
  warnFlags: string[];
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  highlight: { type: Boolean, default: false },
  sets: { type: String, required: true },
  load: { type: String, default: "BW" },
  loadColor: { type: String, default: "" },
  rpe: { type: Number, default: 7 },
  notes: { type: String, default: "" },
  progression: { type: String, default: "" },
  optional: { type: Boolean, default: false },
});

const DrillSchema = new Schema<IDrill>(
  {
    name: { type: String, required: true },
    volume: { type: String, required: true },
    cue: { type: String, required: true },
    isNewDrill: { type: Boolean, default: false },
    highlight: { type: Boolean, default: false },
  },
  { _id: true }
);

const RunIntervalSchema = new Schema<IRunInterval>({
  label: { type: String, required: true },
  value: { type: String, required: true },
  sub: { type: String, default: "" },
});

const DaySchema = new Schema<IDay>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["pull", "push", "legs", "swim", "run", "mma", "rest"],
    required: true,
  },
  optional: { type: Boolean, default: false },
  badge: { type: String, default: "" },
  infoBox: { type: String, default: "" },
  infoBoxColor: { type: String, default: "" },
  exercises: [ExerciseSchema],
  drills: [DrillSchema],
  runStats: [RunIntervalSchema],
  runIntervals: [RunIntervalSchema],
  runNote: { type: String, default: "" },
  mmaNote: { type: String, default: "" },
  sessionNote: { type: String, default: "" },
});

const WeekSchema = new Schema<IWeek>(
  {
    number: { type: Number, required: true, unique: true },
    subtitle: {
      type: String,
      default: "Training Programme — Calisthenics / Swim / Run / MMA",
    },
    priorityStack: [{ type: String }],
    bannerItems: [{ type: String }],
    days: [DaySchema],
    flags: [{ type: String }],
    warnFlags: [{ type: String }],
  },
  { timestamps: true }
);

export const Week = models.Week || model<IWeek>("Week", WeekSchema);
