import mongoose, { Schema, model, models } from "mongoose";

export interface ISetLog {
  reps: string;
  weight: string;
  rpe?: number;
}

export interface IExerciseLog {
  exerciseName: string;
  sets: ISetLog[];
  notes: string;
}

export interface IProgress {
  _id: string;
  date: Date;
  weekNumber: number;
  dayId: string;
  dayName: string;
  sessionType: string;
  energyIn: number;
  energyOut: number;
  exercises: IExerciseLog[];
  sessionNotes: string;
  mmaLog?: string;
}

const SetLogSchema = new Schema<ISetLog>({
  reps: { type: String, default: "" },
  weight: { type: String, default: "" },
  rpe: { type: Number },
});

const ExerciseLogSchema = new Schema<IExerciseLog>({
  exerciseName: { type: String, required: true },
  sets: [SetLogSchema],
  notes: { type: String, default: "" },
});

const ProgressSchema = new Schema<IProgress>(
  {
    date: { type: Date, default: Date.now },
    weekNumber: { type: Number, required: true },
    dayId: { type: String, required: true },
    dayName: { type: String, required: true },
    sessionType: { type: String, required: true },
    energyIn: { type: Number, default: 5 },
    energyOut: { type: Number, default: 5 },
    exercises: [ExerciseLogSchema],
    sessionNotes: { type: String, default: "" },
    mmaLog: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Progress =
  models.Progress || model<IProgress>("Progress", ProgressSchema);
