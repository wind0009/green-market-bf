
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getBotanicalAdvice = async (plantName: string, question: string) => {
  if (!API_KEY) return "Veuillez configurer votre clé API pour profiter des conseils de notre expert.";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un expert botaniste au Burkina Faso. Réponds à la question suivante sur la plante "${plantName}" : ${question}. Ta réponse doit être concise, amicale et adaptée au climat soudano-sahélien.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Désolé, notre expert est momentanément indisponible. Réessayez plus tard.";
  }
};
