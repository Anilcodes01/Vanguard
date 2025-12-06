import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentWeek = await prisma.internshipWeek.findFirst({
      where: {
        userId: user.id,
        unlockAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        weekNumber: "desc",
      },
      include: {
        problems: {
          select: {
            isCompleted: true,
          },
        },
        notes: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentWeek) {
      return NextResponse.json(
        { error: "No active internship week found." },
        { status: 404 }
      );
    }

    const problemsCompleted = currentWeek.problems.filter(
      (p) => p.isCompleted
    ).length;
    const totalProblems = currentWeek.problems.length;
    const journalCount = currentWeek.notes.length;
    const interactionsCount = problemsCompleted + journalCount;

    return NextResponse.json({
      weekNumber: currentWeek.weekNumber,
      startedAt: currentWeek.unlockAt || currentWeek.createdAt,
      journalCount,
      problemsCompleted,
      totalProblems,
      interactionsCount,
    });
  } catch (error) {
    console.error("Error fetching internship progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
