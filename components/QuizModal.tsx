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

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opa
