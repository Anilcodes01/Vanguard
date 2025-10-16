import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekStartDate = getWeekStartDateUTC();

    const userProfileWithGroup = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        currentGroup: {
          select: {
            id: true,
            league: true,
            weekStartDate: true,
            members: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    const group = userProfileWithGroup?.currentGroup;

    if (!group) {
      return NextResponse.json({
        message:
          "You are not in a league this week. Complete a problem to join!",
        leaderboard: [],
      });
    }

    if (group.weekStartDate.getTime() !== weekStartDate.getTime()) {
      return NextResponse.json({
        message:
          "Your league has reset. Complete a problem to join the new week!",
        leaderboard: [],
      });
    }

    const members = group.members;
    if (members.length === 0) {
      return NextResponse.json({
        league: group.league,
        leaderboard: [],
        currentUserId: user.id,
      });
    }

    const memberIds = members.map((member) => member.id);
    const weeklyScores = await prisma.problemSolution.groupBy({
      by: ["userId"],
      where: {
        userId: {
          in: memberIds,
        },
        status: "Solved",
        firstSolvedAt: {
          gte: weekStartDate,
        },
      },
      _sum: {
        xpEarned: true,
      },
    });

    const scoreMap = new Map<string, number>();
    weeklyScores.forEach((score) => {
      scoreMap.set(score.userId, score._sum.xpEarned || 0);
    });

    const leaderboardWithScores = members.map((member) => ({
      ...member,
      weeklyXP: scoreMap.get(member.id) || 0,
    }));

    const sortedLeaderboard = leaderboardWithScores.sort(
      (a, b) => b.weeklyXP - a.weeklyXP
    );

    return NextResponse.json({
      league: group.league,
      leaderboard: sortedLeaderboard,
      currentUserId: user.id,
    });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      {
        message: "Error while fetching leaderboard data",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}