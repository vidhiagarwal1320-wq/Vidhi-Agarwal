import { GoogleGenAI } from "@google/genai";
import { UserProfile, Program } from '../types';

// Safely retrieve API key or empty string
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateShortlistRecommendation = async (profile: UserProfile): Promise<string> => {
  if (!API_KEY) {
    return "AI personalization unavailable (Missing API Key). Based on your profile, we recommend looking at top 50 universities in your selected countries.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this student profile, suggest 3 key factors they should look for in a university program.
      Profile: ${JSON.stringify(profile)}
      Keep it brief and encouraging.`,
    });
    return response.text || "Explore programs that align with your research interests.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Explore programs that match your academic background and budget.";
  }
};

export const generateEssayOutline = async (program: Program, profile: UserProfile): Promise<string> => {
  if (!API_KEY) {
    return `**Outline Placeholder**\n\n1. Introduction: Why ${program.programName}?\n2. Academic Background: Relate to your GPA of ${profile.gpa}.\n3. Future Goals: How this degree helps.\n4. Conclusion.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a structure for a Statement of Purpose for:
      Program: ${program.programName} at ${program.university}
      Student Profile: ${JSON.stringify(profile)}
      
      Output structured Markdown with section headers and bullet points.`,
    });
    return response.text || "Could not generate outline.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating outline. Please try again.";
  }
};

export const analyzeFinanceROI = async (program: Program): Promise<string> => {
    if (!API_KEY) return "ROI Analysis unavailable.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the ROI for ${program.programName} at ${program.university} with tuition $${program.tuition}.
            Provide a short summary of potential salary uplift and break-even period.`
        });
        return response.text || "Analysis pending.";
    } catch (e) {
        return "Could not analyze ROI.";
    }
}
