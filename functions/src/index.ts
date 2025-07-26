// functions/src/index.ts

import * as functions from "firebase-functions";
import {GoogleGenerativeAI} from "@google/generative-ai";

const geminiApiKey = functions.config().gemini?.api_key;

export const generateQuiz = functions.https.onRequest(async (req, res) => {
  // Configure CORS headers for cross-origin requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Ensure the request method is POST
  if (req.method !== "POST") {
    res.status(405).json({error: "Méthode non autorisée. POST seulement."});
    return;
  }

  // Check if Gemini API Key is configured
  if (!geminiApiKey) {
    console.error(
      "Clé API Gemini non configurée dans la config Firebase Functions."
    );
    res.status(500).json({error: "Erreur serveur: Clé API Gemini manquante."});
    return;
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);

  // Debugging: Attempt to list available Gemini models
  try {
    console.log("Tentative de lister les modèles Gemini...");
    const {models} = await genAI.listModels();
    console.log("Modèles Gemini disponibles pour cette clé API et ce projet :");
    let geminiProFound = false;
    for (const modelItem of models) {
      const supportsGenerateContent =
        modelItem.supportedGenerationMethods.includes("generateContent");
      console.log(
        `- Nom: ${modelItem.name}, Supports generateContent: ` +
          `${supportsGenerateContent}`
      );
      if (modelItem.name === "models/gemini-pro" && supportsGenerateContent) {
        geminiProFound = true;
      }
    }
    if (!geminiProFound) {
      console.warn(
        "ATTENTION: Le modèle 'models/gemini-pro' ne semble pas " +
          "disponible ou ne prend pas en charge 'generateContent' " +
          "avec cette clé API."
      );
    }
  } catch (listError) {
    console.error(
      "Erreur lors de la tentative de lister les modèles Gemini:",
      listError
    );
  }

  // Initialize the Gemini Pro model
  const model = genAI.getGenerativeModel({model: "gemini-pro"});

  const {chapter, theme} = req.body;

  // Validate request parameters (chapter and theme)
  if (!chapter || !theme) {
    res.status(400).json({error: "Veuillez fournir le chapitre et le thème."});
    return;
  }

  // Construct the prompt for the Gemini API
  const prompt =
    "Génère 3 questions de quiz sur le programme \"Viens et " +
    "suis-moi 2025 - Doctrine et Alliances\", spécifiquement " +
    `sur le chapitre "${chapter}" et le thème "${theme}".\n` +
    "Chaque question doit avoir une question (\"question\"), " +
    "un tableau de 4 options (\"options\"), et la bonne " +
    "réponse (\"correctAnswer\").\n" +
    "Le format de la réponse doit être un tableau JSON " +
    "d'objets, comme ceci :\n" +
    "[\n" +
    "    {\n" +
    "        \"question\": \"Quel est l'élément central de ce concept ?\",\n" +
    "        \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
    "        \"correctAnswer\": \"Option B\"\n" +
    "    }\n" +
    "]\n" +
    // Cette partie a été coupée pour éviter le max-len
    "Assure-toi que la \"correctAnswer\" " +
    "est EXACTEMENT une des options.";

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean Gemini's response to ensure valid JSON format
    const jsonMatch = text.match(/\[\s*{[^]*}\s*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      console.warn(
        "Regex de nettoyage JSON non matchée. Tentative de parsing direct."
      );
    }

    let quizData;
    try {
      quizData = JSON.parse(text);
      if (
        !Array.isArray(quizData) ||
        !quizData.every((item) => typeof item === "object" && item !== null)
      ) {
        throw new Error("Le format JSON n'est pas un tableau d'objets valide.");
      }
    } catch (jsonError) {
      console.error(
        "Erreur de parsing JSON de la réponse Gemini:",
        jsonError
      );
      console.error("Réponse brute de Gemini:", text);
      res.status(500).json({
        error:
          "Erreur lors du traitement de la réponse de Gemini. " +
          "Le format des questions est incorrect.",
        rawGeminiResponse: text,
      });
      return;
    }

    res.status(200).json(quizData);
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini:", error);
    res.status(500).json({
      error: "Erreur lors de la génération du quiz par l'IA.",
      details: error.message,
    });
  }
});
