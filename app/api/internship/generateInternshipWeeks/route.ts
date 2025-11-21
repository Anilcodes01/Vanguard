import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Profiles } from "@prisma/client";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

interface GeneratedWeek {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
}

interface RawWeekData {
  weekNumber?: number;
  title?: string;
  description?: string;
  topics?: string[];
}

function parseAIResponse(rawText: string): unknown {
  const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleanText);
  } catch {

  }
  
  const firstBrace = cleanText.indexOf('{');
  const firstBracket = cleanText.indexOf('[');
  
  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = cleanText.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = cleanText.lastIndexOf(']');
  }

  if (startIndex !== -1 && endIndex !== -1) {
    try {
      const jsonSubstring = cleanText.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonSubstring);
    } catch (error) {
      console.error("Failed to parse extracted JSON string:", error);
    }
  }

  throw new Error("Could not extract valid JSON from AI response");
}

async function generateInternshipWeeksOnly(userProfile: Profiles): Promise<GeneratedWeek[]> {
  const prompt = `
    You are an API that outputs raw JSON only.
    Based on the following user profile, generate a high-level 12-week internship roadmap.
    
    User Profile:
    - Domain: ${userProfile.domain || "Web Development"}
    - Skill Level: ${userProfile.comfort_level || "Intermediate"}
    - Tech Stack: ${userProfile.preferred_langs.join(", ") || "JavaScript"}
    - Goal: ${userProfile.main_goal.join(", ") || "Improve skills"}

    Requirements:
    1. Output MUST be a JSON object with a key "weeks".
    2. "weeks" must be an array of 12 objects.
    3. Structure: { "weeks": [{ "weekNumber": 1, "title": "...", "description": "...", "topics": ["..."] }] }
    4. Do not include markdown formatting.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    console.log("Response from the AI: ", response);

    const text = response.text;
    if (!text) throw new Error("No text generated.");

    const parsedData = parseAIResponse(text);

    let weeksArray: RawWeekData[] = [];

    const dataAsObject = parsedData as { weeks?: RawWeekData[] };
    const dataAsArray = parsedData as RawWeekData[];

    if (dataAsObject && dataAsObject.weeks && Array.isArray(dataAsObject.weeks)) {
      weeksArray = dataAsObject.weeks;
    } else if (Array.isArray(dataAsArray)) {
      weeksArray = dataAsArray;
    } else {
      console.error("AI returned:", parsedData);
      throw new Error("AI returned valid JSON but invalid schema (missing 'weeks' array)");
    }

    return weeksArray.slice(0, 12).map((w, index) => ({
      weekNumber: w.weekNumber || index + 1,
      title: w.title || `Week ${index + 1}`,
      description: w.description || "",
      topics: w.topics || []
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate valid internship weeks.");
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingWeeks = await prisma.internshipWeek.findMany({
      where: { userId: user.id },
      orderBy: { weekNumber: "asc" },
    });

    if (existingWeeks.length > 0) {
      return NextResponse.json({ internship: existingWeeks }, { status: 200 });
    }

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }
    const generatedWeeks = await generateInternshipWeeksOnly(userProfile);

    const weeksToCreate = generatedWeeks.map((week) => ({
      userId: user.id,
      weekNumber: week.weekNumber, 
      title: week.title,
      description: week.description,
      topics: week.topics,
    }));

    await prisma.internshipWeek.createMany({
      data: weeksToCreate,
      skipDuplicates: true,
    });

    const savedWeeks = await prisma.internshipWeek.findMany({
      where: { userId: user.id },
      orderBy: { weekNumber: "asc" },
    });

    return NextResponse.json({ internship: savedWeeks }, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}