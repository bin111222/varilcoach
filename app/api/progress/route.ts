import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Progress } from "@/lib/models/Progress";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const week = url.searchParams.get("week");
    const query = week ? { weekNumber: Number(week) } : {};
    const logs = await Progress.find(query).sort({ date: -1 }).lean();
    return NextResponse.json(logs);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const log = await Progress.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await Progress.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const allowedFields = ["energyIn", "energyOut", "sessionNotes", "mmaLog"];
    const update: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }

    const updated = await Progress.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "log not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
