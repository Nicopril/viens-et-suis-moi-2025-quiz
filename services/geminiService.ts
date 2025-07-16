import { QuizQuestion } from '../types';

export const generateQuiz = async (reference: string): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erreur serveur');
    }

    const quiz = await response.json();
    if (!Array.isArray(quiz)) {
      throw new Error("Données de quiz malformées");
    }

    return quiz;
  } catch (error) {
    console.error("Erreur lors de la génération du quiz :", error);
    throw new Error("Impossible de générer le quiz");
  }
};

