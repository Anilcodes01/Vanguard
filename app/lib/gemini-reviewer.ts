import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface AIReviewResult {
  score: number;
  summary: string;
  improvements: string[];
}

export async function generateCodeReview(
  projectTitle: string,
  description: string,
  userOverview: string,
  codeContext: string
): Promise<AIReviewResult | null> {
  if (!codeContext) return null;

  try {
    const prompt = `
      You are a Senior Software Engineer reviewing an internship project submission.
      
      PROJECT DETAILS:
      Title: ${projectTitle}
      Description: ${description}
      Student's Overview: ${userOverview}

      CODEBASE CONTEXT (Selected Files):
      ${codeContext}

      TASK:
      Review the code for:
      1. Code Quality & Cleanliness
      2. Project Functionality (based on code logic)
      3. Adherence to best practices (React/Next.js/TypeScript)
      
      OUTPUT FORMAT:
      Return strictly a JSON object (no markdown formatting).
      {
        "score": number (0-10 integer based on quality),
        "summary": "string (A 2-3 sentence encouraging but critical summary)",
        "improvements": ["string", "string", "string"] (3-4 specific bullet points for improvement)
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      console.error("Error: Response text is undefined");
      return null;
    }

    const jsonString = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(jsonString) as AIReviewResult;
  } catch (error) {
    console.error("Gemini Review Error:", error);
    return null;
  }
}
