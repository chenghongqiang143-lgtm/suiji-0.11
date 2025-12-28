import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// We use a safe fallback if no key is present, but per instructions we assume valid key environment.
// However, to prevent app crash if key is missing during dev:
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTemplateOptions = async (topic: string): Promise<string[]> => {
  if (!ai) {
    console.error("Gemini API Key is missing");
    return ["API Key 缺失", "请检查配置"];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a list of 8 to 12 short, creative, and distinct options for a random decision wheel based on the topic: "${topic}". Keep options under 6 words each. The language of the options MUST be Simplified Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const options = JSON.parse(text);
      if (Array.isArray(options)) {
        return options;
      }
    }
    return [];
  } catch (error) {
    console.error("Error generating options:", error);
    throw new Error("Failed to generate creative options.");
  }
};