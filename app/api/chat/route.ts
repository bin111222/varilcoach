import { NextResponse } from "next/server";
import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import { Settings } from "@/lib/models/Settings";
import { Week } from "@/lib/models/Week";
import { Progress } from "@/lib/models/Progress";
import { ChatSession } from "@/lib/models/ChatSession";

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    await connectDB();
    const settings = (await Settings.findOne().lean()) as any;
    const currentWeek = settings?.currentWeek ?? 1;
    const weekData = (await Week.findOne({ number: currentWeek }).lean()) as any;
    const recentProgress = await Progress.find()
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const athleteName = settings?.athleteName ?? "Varil";
    const goals = settings?.goals ?? [];
    const injuries = settings?.injuries ?? "";
    const model = settings?.openaiModel ?? "gpt-4o";

    const programSummary = weekData
      ? `Current Week: ${weekData.number}\nDays: ${weekData.days
          .map(
            (d: any) =>
              `${d.label} (${d.name}): ${
                d.exercises?.length
                  ? d.exercises
                      .map((e: any) => `${e.name} ${e.sets} @ ${e.load}`)
                      .join(", ")
                  : d.type === "swim"
                  ? `${d.drills?.length ?? 0} drills`
                  : d.type === "run"
                  ? d.runStats
                      ?.map((r: any) => `${r.label}: ${r.value}`)
                      .join(", ")
                  : d.type === "mma"
                  ? "MMA Session"
                  : "Rest"
              }`
          )
          .join("\n")}`
      : "No program loaded";

    const recentLogSummary =
      recentProgress.length > 0
        ? `Recent sessions:\n${recentProgress
            .map(
              (p: any) =>
                `${new Date(p.date).toDateString()} — ${p.dayName} (W${p.weekNumber}): Energy in ${p.energyIn}/10, out ${p.energyOut}/10. ${p.sessionNotes || ""}`
            )
            .join("\n")}`
        : "No recent session logs yet.";

    const systemPrompt =
      settings?.systemPromptOverride ||
      `You are a world-class personal fitness coach for ${athleteName}. You are deeply familiar with their training programme and speak with precision, directness, and encouragement.

ATHLETE PROFILE:
- Name: ${athleteName}
- Training style: Calisthenics, Swimming, Running, MMA
- Goals: ${goals.join(", ") || "Not specified"}
- Injuries/notes: ${injuries || "None"}
- Current week: Week ${currentWeek}

CURRENT PROGRAMME:
${programSummary}

RECENT SESSION LOGS:
${recentLogSummary}

COACHING STYLE:
- Be direct and specific. No fluff.
- Reference their actual exercises, loads, and progressions by name.
- When asked about adjustments, consider their energy logs and the progressive overload already built into the programme.
- Speak like a coach who knows them well — not like a generic fitness chatbot.
- Use technical calisthenics/swim/run terminology correctly.
- When they log fatigue or issues, adjust recommendations accordingly.
- Keep responses concise unless they ask for detail.`;

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "No response.";

    if (typeof sessionId === "string" && sessionId.trim().length > 0) {
      const lastUserMessage =
        Array.isArray(messages) && messages.length > 0
          ? String(messages[messages.length - 1]?.content ?? "")
          : "";
      await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", content: lastUserMessage, ts: new Date() },
                { role: "assistant", content: reply, ts: new Date() },
              ],
            },
          },
        },
        { upsert: true, new: true }
      );
    }
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
