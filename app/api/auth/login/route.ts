import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Settings } from "@/lib/models/Settings";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    let user = await User.findOne({ username });

    // Handle the special case for Varil / 3207
    if (username === "Varil" && password === "3207") {
      if (!user) {
        user = await User.create({ username, password });
        // Create default settings for Varil if they don't exist
        await Settings.findOneAndUpdate(
          { userId: user._id },
          { 
            athleteName: "Varil",
            goals: ["Build Strength", "Improve MMA Cardio"],
            currentWeek: 1
          },
          { upsert: true }
        );
      }
      const res = NextResponse.json({ userId: user._id, username: user.username });
      res.cookies.set("pc_unlock", "ok", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ userId: user._id, username: user.username });
    res.cookies.set("pc_unlock", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
