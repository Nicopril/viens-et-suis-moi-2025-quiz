import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("La variable d'environnement API_KEY est manquante.");

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Schéma attendu pour le quiz généré
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
        body: JSON.stringify({ error: "Le champ 'reference' est requis." }),
      };
    }

    const prompt = `
Tu es un expert du programme "Viens et Suis-Moi" de l'Église de Jésus-Christ des Saints des Derniers Jours.
Génère un quiz de 5 questions à choix multiples basées uniquement sur les écritures suivantes : ${reference}.
Chaque question doit avoir exactement 4 propositions, dont une seule correcte.
Ajoute une courte référence scripturaire précise pour chaque bonne réponse (ex: D&A 76:22).
Ne donne aucune explication.
Réponds uniquement avec un tableau JSON strictement conforme à ce format :
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
    console.error("Erreur dans la Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur lors de la génération du quiz." }),
    };
  }
};





