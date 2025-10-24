import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase =await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        domain: true,
        name: true,
        username: true,
        
      },
      
    });

    if (!userProfile || !userProfile.domain) {
      return NextResponse.json(
        { error: "Profile not found or domain not set." },
        { status: 404 }
      );
    }
    const projects = await prisma.project.findMany({
      where: {
        domain: userProfile.domain,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ userProfile, projects });

  } catch (error) { 
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}