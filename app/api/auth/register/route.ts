import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      if (existingUser.password === password) {
        // If the same user is retrying onboarding, let them through
        const res = NextResponse.json({ userId: existingUser._id, username: existingUser.username }, { status: 200 });
        res.cookies.set("pc_unlock", "ok", {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        return res;
      }
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const user = await User.create({ username, password });
    
    const res = NextResponse.json({ userId: user._id, username: user.username }, { status: 201 });
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
