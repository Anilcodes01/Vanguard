import { prisma } from "@/lib/prisma";
import { League } from "@prisma/client";
import { NextResponse } from "next/server";

const PROMOTION_COUNT = 10;
const DEMOTION_COUNT = 5;

function getNextLeague(current: League): League {
  const leagues: League[] = [
    League.Bronze,
    League.Silver,
    League.Gold,
    League.Sapphire,
    League.Ruby,
    League.Emerald,
    League.Amethyst,
    League.Pearl,
    League.Obsidian,
    League.Diamond,
  ];
  const currentIndex = leagues.indexOf(current);
  return leagues[Math.min(currentIndex + 1, leagues.length - 1)];
}

function getPreviousLeague(current: League): League {
  const leagues: League[] = [
    League.Bronze,
    League.Silver,
    League.Gold,
    League.Sapphire,
    League.Ruby,
    League.Emerald,
    League.Amethyst,
    League.Pearl,
    League.Obsidian,
    League.Diamond,
  ];
  const currentIndex = leagues.indexOf(current);
  return leagues[Math.max(currentIndex - 1, 0)];
}

function getPreviousWeekStartDate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const date = new Date(now);
  date.setDate(now.getDate() - dayOfWeek - 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const previousWeekStartDate = getPreviousWeekStartDate();
    const groupsToProcess = await prisma.leaderboardGroup.findMany({
      where: { weekStartDate: previousWeekStartDate },
      include: { members: true },
    });

    for (const group of groupsToProcess) {
      const memberScores = await Promise.all(
        group.members.map(async (member) => {
          const result = await prisma.problemSolution.aggregate({
            where: {
              userId: member.id,
              status: "Solved",
              firstSolvedAt: { gte: previousWeekStartDate },
            },
            _sum: {
              xpEarned: true,
            },
          });
          return { id: member.id, score: result._sum.xpEarned || 0 };
        })
      );

      const sortedMembers = memberScores.sort((a, b) => b.score - a.score);

      const promotionIds = sortedMembers
        .slice(0, PROMOTION_COUNT)
        .map((m) => m.id);
      const demotionIds = sortedMembers
        .slice(sortedMembers.length - DEMOTION_COUNT)
        .map((m) => m.id);

      if (promotionIds.length > 0) {
        await prisma.profiles.updateMany({
          where: { id: { in: promotionIds } },
          data: { league: getNextLeague(group.league) },
        });
      }

      if (demotionIds.length > 0) {
        await prisma.profiles.updateMany({
          where: { id: { in: demotionIds } },
          data: { league: getPreviousLeague(group.league) },
        });
      }
    }

    await prisma.profiles.updateMany({
      where: { currentGroupId: { in: groupsToProcess.map((g) => g.id) } },
      data: { currentGroupId: null },
    });

    return NextResponse.json({
      message: "Weekly leaderboard reset successful.",
    });
  } catch (error) {
    console.error("CRON job failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
