import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";
import { Settings } from "@/lib/models/Settings";
import { Progress } from "@/lib/models/Progress";
import {
  generateProgressLogsForWeeks,
  generateWeeks16,
} from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }
    const { userId } = JSON.parse(text);
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    await connectDB();

    // Force sync indexes to fix the legacy unique 'number' index
    try {
      await Week.syncIndexes();
    } catch (e) {
      console.warn("syncIndexes failed in seed:", e);
      try { await Week.collection.dropIndex("number_1"); } catch (d) {}
    }

    const weeksRaw = generateWeeks16();
    const progressRaw = generateProgressLogsForWeeks(weeksRaw);

    const weeks = weeksRaw.map(w => ({ ...w, userId }));
    const progress = progressRaw.map(p => ({ ...p, userId }));

    await Promise.all([
      Week.deleteMany({ userId }),
      Progress.deleteMany({ userId })
    ]);
    await Week.insertMany(weeks);
    await Progress.insertMany(progress);

    const existing = await Settings.findOne({ userId });
    if (!existing) {
      await Settings.create({
        userId,
        athleteName: "Varil",
        goals: [
          "Master muscle-up → weighted muscle-up",
          "Weighted pull-up 40 kg by week 8",
          "Swim 1500m unbroken",
          "Sub 20 min 5k",
          "MMA fitness base",
        ],
        injuries: "",
        currentWeek: 1,
        units: "kg",
        openaiModel: "gpt-4o",
        programName: "Calisthenics / Swim / Run / MMA",
      });
    } else if (existing.athleteName === "Athlete") {
      existing.athleteName = "Varil";
      await existing.save();
    }

    return NextResponse.json({
      ok: true,
      message: `Seeded Weeks 1–${weeks.length} and ${progress.length} progress logs`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
