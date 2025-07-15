import { QuizQuestion } from '../types';

export const generateQuiz = async (scriptureReference: string): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scriptureReference }), // ✅ clé correcte attendue par le backend
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Réponse invalide du serveur' }));
      throw new Error(errorData.error || `Erreur serveur: ${response.statusText}`);
    }

    const quizData = await response.json();

    // ✅ Validation de la structure
    if (!Array.isArray(quizData) || quizData.some(q => !q.question || !q.options || !q.correctAnswer || !q.reference)) {
      throw new Error("Les données du quiz reçues du serveur sont malformées.");
    }

    return quizData as QuizQuestion[];

  } catch (error) {
    console.error("Erreur lors de la récupération du quiz via le serveur :", error);
    throw new Error(error instanceof Error ? error.message : "Impossible de générer le quiz. Veuillez réessayer.");
  }
};
