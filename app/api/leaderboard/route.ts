import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getWeekStartDateUTC() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); 
  const date = new Date(now.getTime());
  date.setUTCDate(now.getUTCDate() - dayOfWeek);
  date.setUTCHours(0, 0, 0, 0);
  
  return date;
}

export async function GET() {
  const supabase =await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    include: { currentGroup: true },
  });

  if (!profile || !profile.currentGroup) {
    return NextResponse.json({
      message: "You are not in a league this week. Complete a problem to join!",
      data: null,
    });
  }

  const weekStartDate = getWeekStartDateUTC();
  
  if (profile.currentGroup.weekStartDate.getTime() !== weekStartDate.getTime()) {
      return NextResponse.json({
      message: "Your league has reset. Complete a problem to join the new week!",
      data: null,
    });
  }
  
  const groupMembers = await prisma.profiles.findMany({
    where: { currentGroupId: profile.currentGroupId },
    select: {
      id: true,
      name: true,
      avatar_url: true,
    },
  });

   const memberScores = await Promise.all(
    groupMembers.map(async (member) => {
      const result = await prisma.problemSolution.aggregate({
        where: {
          userId: member.id,
          status: 'Solved',
          firstSolvedAt: {
            gte: weekStartDate,
          },
        },
        _sum: {
          xpEarned: true, 
        },
      });
      return {
        ...member,
        weeklyXP: result._sum.xpEarned || 0, 
      };
    })
  );

  const sortedLeaderboard = memberScores.sort((a, b) => b.weeklyXP - a.weeklyXP);

  return NextResponse.json({
    league: profile.currentGroup.league,
    leaderboard: sortedLeaderboard,
    currentUserId: user.id,
  });
}