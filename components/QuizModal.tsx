import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModalProps {
  reference: string;
  day: string;
  onClose: (score: number | null) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ reference, day, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const result = await generateQuiz(reference);
        if (!result.length) throw new Error('Aucune question générée.');
        setQuestions(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [reference]);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    const isCorrectAnswer = option === questions[currentIndex].correctAnswer;
    setIsCorrect(isCorrectAnswer);
    if (isCorrectAnswer) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return <div className="modal">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="modal">
        <p>Erreur : {error}</p>
        <button onClick={() => onClose(null)}>Fermer</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="modal">
        <h2>Quiz terminé !</h2>
        <p>Score : {score} / {questions.length}</p>
        <button onClick={() => onClose(score)}>Fermer</button>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="modal">
      <h3>{question.question}</h3>
      <ul>
        {question.options.map((opt) => (
          <li key={opt}>
            <button
              disabled={!!selected}
              onClick={() => handleAnswer(opt)}
              className={
                selected
                  ? opt === question.correctAnswer
                    ? 'correct'
                    : opt === selected
                    ? 'incorrect'
                    : ''
                  : ''
              }
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <>
          <p>
            {isCorrect ? 'Bonne réponse !' : `Faux. Réponse correcte : ${question.correctAnswer}`}
          </p>
          <p><strong>Référence :</strong> {question.reference}</p>
          <button onClick={nextQuestion}>Suivant</button>
        </>
      )}
    </div>
  );
};

export default QuizModal;


