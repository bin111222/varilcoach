import mongoose, { Schema, model, models } from "mongoose";

export interface IWorkoutSet {
  reps: number;
  weight: number;
  isPR: boolean;
}

export interface IWorkoutExercise {
  name: string;
  sets: IWorkoutSet[];
}

export interface IWorkout {
  userId: string;
  date: Date;
  exercises: IWorkoutExercise[];
}

const WorkoutSetSchema = new Schema<IWorkoutSet>({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  isPR: { type: Boolean, default: false },
});

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  name: { type: String, required: true },
  sets: [WorkoutSetSchema],
});

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    exercises: [WorkoutExerciseSchema],
  },
  { timestamps: true }
);

export const Workout = models.Workout || model<IWorkout>("Workout", WorkoutSchema);
