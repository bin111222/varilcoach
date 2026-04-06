import { NextResponse } from "next/server";
import { Workout } from "@/lib/models/Workout";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const workouts = await Workout.find({ userId }).sort({ date: -1 });
    
    // Logic to find PRs for motivation
    const prs = workouts.flatMap(w => 
      w.exercises.flatMap((ex: any) => 
        ex.sets.filter((s: any) => s.isPR).map((s: any) => ({
          exercise: ex.name,
          weight: s.weight,
          reps: s.reps,
          date: w.date
        }))
      )
    ).slice(0, 3); // Get 3 most recent PRs

    const lastWorkout = workouts[0];
    const totalWorkouts = workouts.length;

    return NextResponse.json({
      workouts,
      motivation: {
        recentPRs: prs,
        lastWorkoutDate: lastWorkout?.date,
        totalWorkouts,
        status: totalWorkouts > 0 ? "KEEP GOING" : "GET STARTED"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
