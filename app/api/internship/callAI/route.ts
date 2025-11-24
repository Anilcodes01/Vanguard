import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.profiles.findUnique({
      where: {
        id: user.id,
      },
    });
    console.log("usr profile: ", userProfile);

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "your-secret-key",
      },
      body: JSON.stringify({
        prompt: userProfile,
        model: "tutor",
        context: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Local AI service failed with status ${response.status}: ${errorText}`
      );
    }

    const text = await response.text();

    return NextResponse.json({ greeting: text, profileData: userProfile });
  } catch (error) {
    console.error("Error in callAI route:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
