import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";
import { Settings } from "@/lib/models/Settings";
import { Progress } from "@/lib/models/Progress";
import {
  generateProgressLogsForWeeks,
  generateWeeks16,
} from "@/lib/seedData";

export async function POST() {
  try {
    await connectDB();

    const weeks = generateWeeks16();
    const progress = generateProgressLogsForWeeks(weeks);

    await Promise.all([Week.deleteMany({}), Progress.deleteMany({})]);
    await Week.insertMany(weeks);
    await Progress.insertMany(progress);

    const existing = await Settings.findOne();
    if (!existing) {
      await Settings.create({
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
