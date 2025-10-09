import { prisma } from "@/lib/prisma";
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        avatar_url: true,
        xp: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}