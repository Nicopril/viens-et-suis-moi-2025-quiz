import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModalProps {
  lessonTitle: string;
  reference: string;
  day: string;
  onClose: (score: number | null) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ lessonTitle, reference, day, onClose }) => {
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
        const quizQuestions = await generateQuiz(reference);
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
  }, [reference]);

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

  if (isLoading) return <div>Chargement du quiz...</div>;

  if (error) return (
    <div>
      <p>Erreur : {error}</p>
      <button onClick={() => onClose(null)}>Fermer</button>
    </div>
  );

  if (isFinished) return (
    <div>
      <p>Quiz terminé ! Score : {score} / {questions.length}</p>
      <button onClick={() => onClose(score)}>Fermer</button>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2>{lessonTitle} - {day}</h2>
      <p>{currentQuestion.question}</p>
      {currentQuestion.options.map((opt, idx) => (
        <button key={idx} onClick={() => handleAnswerSubmit(opt)}>{opt}</button>
      ))}
      {answerStatus && (
        <div>
          <p>{answerStatus.isCorrect ? "Bonne réponse !" : `La bonne réponse était : ${currentQuestion.correctAnswer}`}</p>
          <p><strong>Référence :</strong> {currentQuestion.reference}</p>
          <button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizModal;

