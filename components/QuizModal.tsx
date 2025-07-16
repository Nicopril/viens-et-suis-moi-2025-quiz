import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModalProps {
  lessonReference: string; // 🟢 on utilise maintenant la référence
  day: string;
  onClose: (score: number | null) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ lessonReference, day, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<{ selected: string; isCorrect: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quizQuestions = await generateQuiz(lessonReference); // 🟢 ici on utilise lessonReference
        if (quizQuestions.length === 0) {
          throw new Error("Le quiz généré est vide.");
        }
        setQuestions(quizQuestions);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur inconnue est survenue.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonReference]);

  const handleAnswerSubmit = (answer: string) => {
    if (answerStatus) return;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) setScore(s => s + 1);
    setAnswerStatus({ selected: answer, isCorrect });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setAnswerStatus(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Génération du quiz...</h2>
          <p className="text-slate-500">Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  // --- DÉBUT DE LA CORRECTION POUR LE BLOC D'ERREUR ---
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur !</h2>
          <p className="text-slate-700 mb-4">{error}</p>
          <button
            onClick={() => onClose(null)} // Ou une autre action pour fermer le modal d'erreur
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }
  // --- FIN DE LA CORRECTION POUR LE BLOC D'ERREUR ---


  const currentQuestion = questions[currentQuestionIndex];

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center w-full max-w-md">
          <h2 className="text-2xl font-bold text-sky-700 mb-4">Quiz Terminé !</h2>
          <p className="text-xl mb-6">Votre score : <span className="font-bold text-sky-600">{score} / {questions.length}</span></p>
          <button
            onClick={() => onClose(score)}
            className="px-6 py-3 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Fermer le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-sky-700 mb-6">Question {currentQuestionIndex + 1} / {questions.length}</h2>
        <p className="text-lg mb-6">{currentQuestion?.question}</p>
        <div className="space-y-4">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSubmit(option)}
              disabled={!!answerStatus}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${answerStatus 
                  ? (option === currentQuestion.correctAnswer 
                    ? 'bg-green-100 border-green-500 text-green-800' 
                    : (option === answerStatus.selected 
                      ? 'bg-red-100 border-red-500 text-red-800' 
                      : 'bg-gray-100 border-gray-300 text-gray-700'))
                  : 'bg-white border-gray-300 text-gray-800 hover:bg-sky-50 hover:border-sky-400'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
        {answerStatus && (
          <div className="mt-6 text-center">
            {answerStatus.isCorrect ? (
              <p className="text-green-600 font-semibold text-lg">Bonne réponse !</p>
            ) : (
              <p className="text-red-600 font-semibold text-lg">
                Mauvaise réponse. La bonne réponse était : <span className="font-bold">"{currentQuestion.correctAnswer}"</span>
              </p>
            )}
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-6 py-3 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir mon score'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;