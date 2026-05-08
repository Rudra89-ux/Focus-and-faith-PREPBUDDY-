import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAccountabilityMessage(context: {
  sessionsThisWeek: number;
  totalHours: number;
  distractions: number;
  streak: number;
  rank: string;
}) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are PrepBuddy, a smart, disciplined, and slightly funny AI accountability coach for a student focus app.
      Analyze this user's stats and provide a short, motivating, yet firm message (max 2 sentences).
      Stats: 
      - Sessions this week: ${context.sessionsThisWeek}
      - Total focus hours: ${context.totalHours}
      - Distractions detected: ${context.distractions}
      - Current Streak: ${context.streak}
      - Current Rank: ${context.rank}
      
      If they are doing well, be encouraging but keep them focused. 
      If they are procrastinating (high distractions or low sessions), "roast" them slightly but keep it motivating.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Your goals are waiting. Lock in.";
  }
}

export async function analyzeDistractionPatterns(distractions: string[]) {
  // Logic to analyze what usually distracts the user
  // This could be more complex, but for now a simple analysis
}
