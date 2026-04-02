import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Week } from "@/lib/models/Week";

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
    const body = await req.json();
    const week = await Week.findOneAndUpdate(
      { number: Number(id) },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!week) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(week);
  } catch (err) {
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
