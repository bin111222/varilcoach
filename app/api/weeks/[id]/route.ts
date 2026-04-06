import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";

function sanitizeWeekPayload(body: any) {
  const safeDays = Array.isArray(body?.days)
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
        runStats: Array.isArray(d?.runStats)
          ? d.runStats.map((r: any) => ({
              label: r?.label ?? "",
              value: r?.value ?? "",
              sub: r?.sub ?? "",
            }))
          : [],
        runIntervals: Array.isArray(d?.runIntervals)
          ? d.runIntervals.map((r: any) => ({
              label: r?.label ?? "",
              value: r?.value ?? "",
              sub: r?.sub ?? "",
            }))
          : [],
        runNote: d?.runNote ?? "",
        mmaNote: d?.mmaNote ?? "",
        sessionNote: d?.sessionNote ?? "",
      }))
    : [];

  return {
    number: Number(body?.number),
    subtitle: body?.subtitle ?? "Training Programme — Calisthenics / Swim / Run / MMA",
    priorityStack: Array.isArray(body?.priorityStack) ? body.priorityStack : [],
    bannerItems: Array.isArray(body?.bannerItems) ? body.bannerItems : [],
    days: safeDays,
    flags: Array.isArray(body?.flags) ? body.flags : [],
    warnFlags: Array.isArray(body?.warnFlags) ? body.warnFlags : [],
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const week = await Week.findOne({ number: Number(id) }).lean();
    if (!week) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(week);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = sanitizeWeekPayload(await req.json());
    const week = await Week.findOne({ number: Number(id) });
    if (!week) return NextResponse.json({ error: "Not found" }, { status: 404 });
    week.subtitle = body.subtitle;
    week.priorityStack = body.priorityStack;
    week.bannerItems = body.bannerItems;
    week.days = body.days;
    week.flags = body.flags;
    week.warnFlags = body.warnFlags;
    await week.save();
    return NextResponse.json(week);
  } catch (err) {
    console.error("PUT /api/weeks/[id] failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Week.findOneAndDelete({ number: Number(id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
