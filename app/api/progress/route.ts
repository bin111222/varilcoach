import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Progress } from "@/lib/models/Progress";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    const week = url.searchParams.get("week");
    const query: any = { userId };
    if (week) query.weekNumber = Number(week);
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
    const { userId, ...progressData } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    const log = await Progress.create({ ...progressData, userId });
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
    const userId = url.searchParams.get("userId");
    if (!id || !userId) return NextResponse.json({ error: "id and userId required" }, { status: 400 });
    await Progress.findOneAndDelete({ _id: id, userId });
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
    const body = await req.json();
    const { userId, ...updateBody } = body;

    if (!id || !userId) return NextResponse.json({ error: "id and userId required" }, { status: 400 });

    const allowedFields = ["energyIn", "energyOut", "sessionNotes", "mmaLog", "exercises"];
    const update: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (key in updateBody) update[key] = updateBody[key];
    }

    const updated = await Progress.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "log not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
