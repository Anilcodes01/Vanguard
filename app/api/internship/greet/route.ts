import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function POST(req: NextRequest) {
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

    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const prompt = `
      You are a friendly and encouraging onboarding assistant for a platform that helps users learn and grow.
      A user has just started the onboarding process. Their profile data is below.
      Generate a short, welcoming, and personalized greeting (2-3 sentences).
      Mention one or two specific details from their profile to make it feel personal, for example, their college, primary field of study, or main goals.
      End with an encouraging sentence about starting their journey.

      User Profile Data:
      - Name: ${userProfile.name || "User"}
      - College: ${userProfile.college_name || "Not provided"}
      - Year of Study: ${userProfile.year_of_study || "Not provided"}
      - Primary Field: ${userProfile.primary_field || "Not provided"}
      - Main Goals: ${userProfile.main_goal?.join(", ") || "Not specified"}
      - Preferred Languages: ${
        userProfile.preferred_langs?.join(", ") || "Not specified"
      }
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const greeting = result.text;

    return NextResponse.json({
      greeting: greeting,
      profileData: userProfile,
    });
  } catch (error) {
    console.error("Error in /api/greet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}