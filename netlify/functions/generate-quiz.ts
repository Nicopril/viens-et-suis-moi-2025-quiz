// netlify/functions/generate-quiz.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async function(event, context) {
    // Vérifiez que la méthode est POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Méthode non autorisée. Seul POST est accepté.' }),
        };
    }

    // Récupérez la clé API Gemini des variables d'environnement de Netlify Function
    // ATTENTION : Cette variable doit être ajoutée SÉPARÉMENT des variables du site (voir point 7 de la Partie 2 dans ma réponse précédente)
    // Nommez-la GEMINI_API_KEY (sans VITE_) sur Netlify
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("Clé API Gemini non configurée dans les variables d'environnement Netlify Function.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur: Clé API Gemini manquante.' }),
        };
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Vous pouvez ajuster le modèle si besoin

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Corps de requête JSON invalide.' }),
        };
    }

    const { chapter, theme } = requestBody;

    if (!chapter || !theme) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Veuillez fournir le chapitre et le thème.' }),
        };
    }

    const prompt = `Génère 3 questions de quiz sur le programme "Viens et suis-moi 2025 - Doctrine et Alliances", spécifiquement sur le chapitre "${chapter}" et le thème "${theme}".
    Chaque question doit avoir une question ("question"), un tableau de 4 options ("options"), et la bonne réponse ("correctAnswer").
    Le format de la réponse doit être un tableau JSON d'objets, comme ceci :
    [
        {
            "question": "Quel est l'élément central de ce concept ?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option B"
        }
    ]
    Assure-toi que la "correctAnswer" est EXACTEMENT une des options.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Nettoyage de la réponse de Gemini pour s'assurer que c'est un JSON valide
        // Gemini peut parfois inclure du texte explicatif avant ou après le JSON
        const jsonMatch = text.match(/\[\s*{[^]*}\s*\]/); // Regex pour trouver un tableau JSON
        if (jsonMatch) {
            text = jsonMatch[0]; // Utilise seulement la partie JSON
        } else {
            // Si la regex échoue, tente de parser directement (moins robuste)
            console.warn("Regex de nettoyage JSON non matchée. Tentative de parsing direct.");
        }

        let quizData;
        try {
            quizData = JSON.parse(text);
            // Valider que c'est un tableau et que chaque élément est un objet
            if (!Array.isArray(quizData) || !quizData.every(item => typeof item === 'object' && item !== null)) {
                throw new Error("Le format JSON n'est pas un tableau d'objets valide.");
            }
        } catch (jsonError) {
            console.error("Erreur de parsing JSON de la réponse Gemini:", jsonError);
            console.error("Réponse brute de Gemini:", text);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Erreur lors du traitement de la réponse de Gemini. Le format des questions est incorrect.',
                    rawGeminiResponse: text
                }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData),
        };

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de la génération du quiz par l\'IA.', details: error.message }),
        };
    }
};




