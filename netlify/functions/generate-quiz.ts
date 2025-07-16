import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY manquant.");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      reference: { type: Type.STRING },
    },
    required: ["question", "options", "correctAnswer", "reference"],
  },
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  try {
    const { reference } = JSON.parse(event.body || '{}');
    if (!reference) {
      return { statusCode: 400, body: JSON.stringify({ error: "Le paramètre 'reference' est requis." }) };
    }

    const prompt = `
Tu es un expert du programme "Viens et Suis-Moi" de l'Église de Jésus-Christ des Saints des Derniers Jours.
Génère un quiz à choix multiples de 5 questions uniquement basé sur les passages suivants : ${reference}.
Chaque question doit inclure 4 choix de réponse, une seule correcte, et la référence scripturaire précise à l’appui.
Retourne un tableau JSON strictement conforme à ce format :
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": "...",
    "reference": "..."
  }
]
Pas d’explication, pas de texte en dehors du JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text.trim(),
    };
  } catch (err: any) {
    console.error("Erreur quiz:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur lors de la génération du quiz." }) };
  }
};





