// /app/api/internship/callAI/route.ts

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
    console.log('usr profile: ', userProfile)

    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // ... (Your fetch call to the local AI service remains the same)
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

    // ✅ ***FIX IS HERE***
    // Return BOTH the greeting and the profile data
    return NextResponse.json({ greeting: text, profileData: userProfile });

  } catch (error) {
    // ... (error handling remains the same)
    console.error("Error in callAI route:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}