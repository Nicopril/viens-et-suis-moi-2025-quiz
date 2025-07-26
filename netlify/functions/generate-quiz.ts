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
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("Clé API Gemini non configurée dans les variables d'environnement Netlify Function.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur: Clé API Gemini manquante.' }),
        };
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Le modèle est défini ici, nous le gardons pour l'appel generateContent plus tard
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 

    // --- DÉBUT DU CODE DE DÉBOGAGE POUR LISTER LES MODÈLES ---
    try {
        console.log("Tentative de lister les modèles Gemini...");
        const { models } = await genAI.listModels(); // Appel à listModels
        console.log("Modèles Gemini disponibles pour cette clé API et ce projet :");
        let geminiProFound = false;
        for (const modelItem of models) { // Renommage en 'modelItem' pour éviter un conflit avec 'model' déclaré plus haut
            const supportsGenerateContent = modelItem.supportedGenerationMethods.includes('generateContent');
            console.log(`- Nom: ${modelItem.name}, Prend en charge generateContent: ${supportsGenerateContent}`);
            if (modelItem.name === 'models/gemini-pro' && supportsGenerateContent) {
                geminiProFound = true;
            }
        }
        if (!geminiProFound) {
            console.warn("ATTENTION: Le modèle 'models/gemini-pro' ne semble pas disponible ou ne prend pas en charge 'generateContent' avec cette clé API.");
            // Si le modèle n'est pas trouvé ou supporté, vous pourriez envisager de retourner une erreur spécifique ici
            // Ou d'essayer un autre modèle si vous en avez un de secours.
        }
    } catch (listError) {
        console.error("Erreur lors de la tentative de lister les modèles Gemini:", listError);
        // Ne pas retourner d'erreur 500 ici, juste un avertissement,
        // car le problème principal est l'appel à generateContent.
    }
    // --- FIN DU CODE DE DÉBOGAGE ---


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
        // L'appel original qui cause l'erreur 500
        const result = await model.generateContent(prompt); 
        const response = await result.response;
        let text = response.text();

        // Nettoyage de la réponse de Gemini pour s'assurer que c'est un JSON valide
        const jsonMatch = text.match(/\[\s*{[^]*}\s*\]/); // Regex pour trouver un tableau JSON
        if (jsonMatch) {
            text = jsonMatch[0]; // Utilise seulement la partie JSON
        } else {
            console.warn("Regex de nettoyage JSON non matchée. Tentative de parsing direct.");
        }

        let quizData;
        try {
            quizData = JSON.parse(text);
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




