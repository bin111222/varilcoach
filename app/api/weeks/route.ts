import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";

export async function GET() {
  try {
    await connectDB();
    const weeks = await Week.find().sort({ number: 1 }).lean();
    return NextResponse.json(weeks);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const week = await Week.create(body);
    return NextResponse.json(week, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
