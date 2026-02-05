
import { GoogleGenAI } from "@google/genai";

// Fix: Removed the separate API_KEY variable and guard clause to adhere to strict initialization rules.
// The SDK instance is now created within the service call using process.env.API_KEY directly.

export const getBotanicalAdvice = async (plantName: string, question: string) => {
  try {
    // Fix: Initialize GoogleGenAI with process.env.API_KEY directly as required by the coding guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un expert botaniste au Burkina Faso. Réponds à la question suivante sur la plante "${plantName}" : ${question}. Ta réponse doit être concise, amicale et adaptée au climat soudano-sahélien.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Fix: Accessing .text as a property of the GenerateContentResponse object.
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Désolé, notre expert est momentanément indisponible. Réessayez plus tard.";
  }
};
