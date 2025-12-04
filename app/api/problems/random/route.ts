import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.problem.count({
      where: { isLocked: false },
    });

    if (count === 0) {
      return NextResponse.json(
        { message: "No problems found" },
        { status: 404 }
      );
    }

    const skip = Math.floor(Math.random() * count);

    const randomProblem = await prisma.problem.findFirst({
      where: { isLocked: false },
      skip: skip,
      select: { id: true },
    });

    if (!randomProblem) {
      return NextResponse.json(
        { message: "Error finding problem" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: randomProblem.id });
  } catch (error) {
    console.error("Random problem fetch error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
