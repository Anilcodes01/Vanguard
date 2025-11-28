import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const weekNumber = parseInt(searchParams.get("weekNumber") || "");

    if (!weekNumber)
      return NextResponse.json({ error: "Week required" }, { status: 400 });

    const internshipWeek = await prisma.internshipWeek.findUnique({
      where: {
        userId_weekNumber: { userId: user.id, weekNumber: weekNumber },
      },
    });

    if (!internshipWeek) return NextResponse.json({ notes: [] });

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        internshipWeekId: internshipWeek.id,
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { content, weekNumber, entityId, type } = body;

    if (!weekNumber)
      return NextResponse.json({ error: "Week required" }, { status: 400 });

    const internshipWeek = await prisma.internshipWeek.findUnique({
      where: {
        userId_weekNumber: {
          userId: user.id,
          weekNumber: parseInt(weekNumber),
        },
      },
    });

    if (!internshipWeek)
      return NextResponse.json({ error: "Week not found" }, { status: 404 });

    const whereClause: Prisma.NoteWhereInput = {
      userId: user.id,
      internshipWeekId: internshipWeek.id,
    };

    const dataField: Prisma.NoteUncheckedCreateInput = {
      userId: user.id,
      internshipWeekId: internshipWeek.id,
      content: content,
    };

    if (type === "problem") {
      whereClause.internshipProblemId = entityId;
      dataField.internshipProblemId = entityId;
    } else if (type === "project") {
      whereClause.internshipProjectId = entityId;
      dataField.internshipProjectId = entityId;
    } else {
      whereClause.internshipProblemId = null;
      whereClause.internshipProjectId = null;
    }

    const existingNote = await prisma.note.findFirst({ where: whereClause });

    let result;
    if (existingNote) {
      result = await prisma.note.update({
        where: { id: existingNote.id },
        data: { content },
      });
    } else {
      result = await prisma.note.create({
        data: dataField,
      });
    }

    return NextResponse.json({ success: true, note: result });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
