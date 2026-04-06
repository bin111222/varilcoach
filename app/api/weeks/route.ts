import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";

function sanitizeWeekPayload(body: any) {
  return {
    number: Number(body?.number),
    subtitle: body?.subtitle ?? "Training Programme — Calisthenics / Swim / Run / MMA",
    priorityStack: Array.isArray(body?.priorityStack) ? body.priorityStack : [],
    bannerItems: Array.isArray(body?.bannerItems) ? body.bannerItems : [],
    days: Array.isArray(body?.days)
      ? body.days.map((d: any) => ({
          id: d?.id,
          name: d?.name ?? "",
          label: d?.label ?? "",
          type: d?.type,
          optional: Boolean(d?.optional),
          badge: d?.badge ?? "",
          infoBox: d?.infoBox ?? "",
          infoBoxColor: d?.infoBoxColor ?? "",
          exercises: Array.isArray(d?.exercises)
            ? d.exercises.map((e: any) => ({
                name: e?.name ?? "",
                highlight: Boolean(e?.highlight),
                sets: e?.sets ?? "",
                load: e?.load ?? "BW",
                loadColor: e?.loadColor ?? "",
                rpe: Number(e?.rpe ?? 7),
                notes: e?.notes ?? "",
                progression: e?.progression ?? "",
                optional: Boolean(e?.optional),
              }))
            : [],
          drills: Array.isArray(d?.drills)
            ? d.drills.map((dr: any) => ({
                name: dr?.name ?? "",
                volume: dr?.volume ?? "",
                cue: dr?.cue ?? "",
                isNewDrill: Boolean(dr?.isNewDrill ?? dr?.isNew),
                highlight: Boolean(dr?.highlight),
              }))
            : [],
          runStats: Array.isArray(d?.runStats) ? d.runStats : [],
          runIntervals: Array.isArray(d?.runIntervals) ? d.runIntervals : [],
          runNote: d?.runNote ?? "",
          mmaNote: d?.mmaNote ?? "",
          sessionNote: d?.sessionNote ?? "",
        }))
      : [],
    flags: Array.isArray(body?.flags) ? body.flags : [],
    warnFlags: Array.isArray(body?.warnFlags) ? body.warnFlags : [],
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No userId provided" }, { status: 400 });
    }

    const weeks = await Week.find({ userId }).sort({ number: 1 }).lean();
    return NextResponse.json(weeks);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const { userId, ...body } = data;

    if (!userId) {
      return NextResponse.json({ error: "No userId provided" }, { status: 400 });
    }

    const sanitized = sanitizeWeekPayload(body);
    const week = await Week.create({ ...sanitized, userId });
    return NextResponse.json(week, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
