import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY manquant");

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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Méthode non autorisée" }),
    };
  }

  try {
    const { reference } = JSON.parse(event.body || "{}");

    if (!reference) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le paramètre 'reference' est requis." }),
      };
    }

    const prompt = `
Tu es un expert du programme "Viens et Suis-Moi" de l'Église de Jésus-Christ des Saints des Derniers Jours.
Génère un quiz de 5 questions à choix multiples basé uniquement sur les écritures suivantes : ${reference}.
Chaque question doit avoir 4 propositions de réponse, dont une seule correcte.
Fournis la référence scripturaire précise pour justifier la bonne réponse.
Retourne un tableau JSON conforme au schéma :
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "C",
    "reference": "Doctrine et Alliances 1:5"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const jsonText = response.text.trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: jsonText,
    };
  } catch (error) {
    console.error("Erreur serveur:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossible de générer le quiz." }),
    };
  }
};





