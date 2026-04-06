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
    return NextResponse.json(workouts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const { userId, date, exercises } = body;

    if (!userId || !exercises) {
      return NextResponse.json({ error: "User ID and exercises required" }, { status: 400 });
    }

    const workout = await Workout.create({
      userId,
      date: date ? new Date(date) : new Date(),
      exercises,
    });

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const { id, date, exercises } = body;

    if (!id || !exercises) {
      return NextResponse.json({ error: "Workout ID and exercises required" }, { status: 400 });
    }

    const workout = await Workout.findByIdAndUpdate(
      id,
      {
        date: date ? new Date(date) : new Date(),
        exercises,
      },
      { new: true }
    );

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Workout ID required" }, { status: 400 });
  }

  try {
    const workout = await Workout.findByIdAndDelete(id);
    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Workout deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
