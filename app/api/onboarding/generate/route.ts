import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";
import { generateWeekFromBase } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const { userId, athleteName, goals, injuries, experience, daysPerWeek, focus, units, maxPullups, maxDips, maxPushups, runPace, numWeeks, useCustomSchedule, customSchedule } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const scheduleStr = useCustomSchedule 
      ? `\nCUSTOM SCHEDULE (Follow this exactly for Week 1):\n${Object.entries(customSchedule).map(([day, type]) => `${day.toUpperCase()}: ${String(type).toUpperCase()}`).join("\n")}`
      : `\nTraining Frequency: ${daysPerWeek} days per week. Distribute the training days logically based on focus areas.`;

    // Ensure we have a valid MongoDB ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalWeeks = Number(numWeeks) || 4;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are a world-class fitness coach specializing in Calisthenics, MMA, Swimming, and Running. 
Your task is to generate a highly personalized WEEK 1 training program for an athlete.

ATHLETE INFO:
- Name: ${athleteName}
- Goals: ${goals}
- Injuries/Limitations: ${injuries}
- Experience Level: ${experience}
${scheduleStr}
- Focus Areas: ${focus.join(", ")}
- Units: ${units}
- Baseline Stats: Max Pull-ups: ${maxPullups}, Max Dips: ${maxDips}, Max Push-ups: ${maxPushups}, 5k Pace: ${runPace}

OUTPUT FORMAT:
You MUST output a valid JSON object matching the following structure (Week 1):
{
  "number": 1,
  "subtitle": "Personalized Training Phase 1",
  "priorityStack": ["String explaining priority 1", "String explaining priority 2"],
  "bannerItems": ["String 1", "String 2"],
  "days": [
    {
      "id": "mon",
      "name": "PULL DAY",
      "label": "Monday",
      "type": "pull",
      "optional": false,
      "badge": "Strength",
      "infoBox": "",
      "exercises": [
        { "name": "Exercise Name", "sets": "3 × 8", "load": "20 kg", "rpe": 7, "notes": "Coach's note", "highlight": false }
      ]
    },
    ... (total 7 days, use 'rest' type for off days)
  ],
  "flags": ["Important note 1"],
  "warnFlags": ["Warning note 1"]
}

Types for 'type' field: 'pull', 'push', 'legs', 'swim', 'run', 'mma', 'rest'.
For 'run' days, you can include 'runStats' or 'runIntervals'. 
IMPORTANT: Both 'runStats' and 'runIntervals' MUST be an array of objects: [{"label": "Required String", "value": "Required String", "sub": "Optional String"}]. 
NEVER output an empty object {} inside these arrays. 
If you don't have a label or value, OMIT that entry from the array or omit the entire array field.
For 'swim' days, you can include a 'drills' array: [{"name": "Drill Name", "volume": "4 × 25m", "cue": "Technical cue"}].
For 'mma' days, you can include a 'mmaNote' string.
For 'rest' days, keep exercises, drills, and run fields empty.

IMPORTANT:
- Align the volume/load with the athlete's baseline stats (e.g. if max pullups is 5, don't prescribe 4x10).
- Respect injuries.
- ${useCustomSchedule ? "YOU MUST follow the CUSTOM SCHEDULE provided above for the 'type' and order of days. Do NOT change it." : `Distribute the ${daysPerWeek} training days logically based on focus areas.`}
- Ensure the JSON is perfectly valid.`;

    console.log(`Generating ${totalWeeks} weeks for user ${userId} (${athleteName})`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Generate Week 1 program now." }],
      response_format: { type: "json_object" }
    });

    const week1Json = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    if (!week1Json.days || !Array.isArray(week1Json.days)) {
      console.error("AI Response:", completion.choices[0]?.message?.content);
      throw new Error("AI generated an invalid program structure (missing days).");
    }

    // Basic validation and cleaning
    week1Json.number = 1;
    week1Json.days.forEach((day: any) => {
      if (!day.exercises) day.exercises = [];
      day.exercises = (day.exercises || []).filter((ex: any) => ex && ex.name && ex.sets);
      
      // Clean up runStats/runIntervals
      ["runStats", "runIntervals"].forEach(field => {
        if (day[field] && Array.isArray(day[field])) {
          day[field] = day[field].filter((item: any) => item && item.label && item.value);
        } else {
          delete day[field];
        }
      });

      if (!day.type) day.type = "rest";
    });

    await connectDB();
    
    // Force sync indexes to ensure the compound unique index is present
    // and the old single-field unique index is removed.
    try {
      console.log("Syncing Week indexes...");
      await Week.syncIndexes();
    } catch (e) {
      console.warn("syncIndexes failed, attempting manual drop of number_1:", e);
      try {
        await Week.collection.dropIndex("number_1");
      } catch (dropErr) {
        // ignore
      }
    }

    // Clear any existing weeks for this user to avoid duplicates
    await Week.deleteMany({ userId: userObjectId });
    
    // Save Week 1
    console.log("Saving Week 1...");
    const week1 = await Week.create({ ...week1Json, userId: userObjectId });

    // Generate subsequent weeks using logic from seedData
    console.log(`Generating ${totalWeeks - 1} additional weeks...`);
    const additionalWeeks = [];
    for (let n = 2; n <= totalWeeks; n++) {
      try {
        const nextWeek = generateWeekFromBase(week1Json, n, 1);
        additionalWeeks.push({ ...nextWeek, userId: userObjectId });
      } catch (genErr) {
        console.error(`Failed to generate week ${n}:`, genErr);
        // Fallback to a simpler clone if logic fails
        additionalWeeks.push({ ...week1Json, number: n, userId: userObjectId });
      }
    }

    if (additionalWeeks.length > 0) {
      console.log(`Inserting ${additionalWeeks.length} weeks...`);
      await Week.insertMany(additionalWeeks);
    }
    
    console.log("Onboarding generation complete!");
    return NextResponse.json({ success: true, weekId: week1._id });

  } catch (err) {
    console.error("Onboarding generation failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
