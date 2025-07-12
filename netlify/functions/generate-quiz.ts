import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("La variable d'environnement API_KEY n'est pas définie.");
}

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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  }

  try {
    const { lessonTitle, day } = JSON.parse(event.body || '{}');

    if (!lessonTitle || !day) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Les paramètres lessonTitle et day sont requis.' }),
      };
    }

    const prompt = `
      Tu es un expert du programme "Viens et Suis-Moi" de l'Église de Jésus-Christ des Saints des Derniers Jours.
      Pour la leçon de 2025 intitulée "${lessonTitle}", génère un quiz à choix multiples de 5 questions basé sur les enseignements du jour : "${day}".
      Chaque question doit avoir 4 options de réponse, avec une seule réponse correcte.
      Pour chaque question, fournis la référence scripturaire exacte (livre, chapitre, versets) qui justifie la bonne réponse.
      La bonne réponse doit être l'une des 4 options.
      Retourne le résultat exclusivement au format JSON, en respectant le schéma fourni. N'inclus aucun texte, formatage ou backticks de code en dehors de l'objet JSON.
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
    // Pas besoin de parser, on renvoie directement le texte JSON
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: jsonText,
    };

  } catch (error) {
    console.error("Erreur dans la Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossible de générer le quiz via le serveur." }),
    };
  }
};
