import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModalProps {
  lessonTitle: string;
  day: string;
  onClose: (score: number | null) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ lessonTitle, day, onClose }) => {
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
        const quizQuestions = await generateQuiz(lessonTitle, day);
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
  }, [lessonTitle, day]);

  const handleAnswerSubmit = (answer: string) => {
    if (answerStatus) return; // Prevent answering again

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setAnswerStatus({ selected: answer, isCorrect });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setAnswerStatus(null); // Reset for the next question
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

  if (error) {
    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => onClose(null)} className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-sky-700 mb-4">Quiz Terminé !</h2>
          <p className="text-4xl font-bold mb-2">{score} / {questions.length}</p>
          <p className="text-slate-600 mb-6">Votre score a été enregistré.</p>
          <button onClick={() => onClose(score)} className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
            Fermer
          </button>
        </div>
      </div>
    );
  }
  
  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  const getButtonClass = (option: string) => {
    if (!answerStatus) {
      return 'bg-slate-50 hover:bg-slate-100 border-slate-200';
    }

    const isCorrectAnswer = option === currentQuestion.correctAnswer;
    const isSelectedAnswer = option === answerStatus.selected;

    if (isCorrectAnswer) {
      return 'bg-green-100 border-green-500 text-green-800 font-semibold ring-2 ring-green-300';
    }
    if (isSelectedAnswer && !answerStatus.isCorrect) {
      return 'bg-red-100 border-red-500 text-red-800 font-semibold ring-2 ring-red-300';
    }
    
    return 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl">
        <div className="mb-4">
          <p className="text-sm text-sky-600 font-semibold">{lessonTitle} - {day}</p>
          <p className="text-slate-500">Question {currentQuestionIndex + 1} sur {questions.length}</p>
        </div>
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSubmit(option)}
              disabled={!!answerStatus}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>

        {answerStatus && (
          <div className="mt-6 p-4 bg-sky-50 border-l-4 border-sky-400 rounded-r-lg animate-fade-in">
            <p className="font-bold text-sky-800">
              {answerStatus.isCorrect ? 'Bonne réponse !' : `La bonne réponse était : ${currentQuestion.correctAnswer}`}
            </p>
            <p className="text-slate-700 mt-1">
              <strong>Référence :</strong> <span className="font-medium">{currentQuestion.reference}</span>
            </p>
          </div>
        )}

        <div className="mt-8 text-right">
          <button
            onClick={handleNextQuestion}
            disabled={!answerStatus}
            className="px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizModal;