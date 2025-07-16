.import React, { useState } from 'react';
import LessonSelector from '../components/LessonSelector';
import QuizModal from '../components/QuizModal';
import { lessons } from '../data/lessons';
import { useUser } from '../context/UserContext';

const QuizPage: React.FC = () => {
  const { user, scores, markDayAsCompleted } = useUser();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(23); // Par défaut la leçon 24 (index 23)
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const currentLesson = lessons[selectedLessonIndex];

  const handleQuizComplete = (score: number | null) => {
    if (score !== null && activeDay) {
      markDayAsCompleted(selectedLessonIndex, activeDay, score);
    }
    setActiveDay(null);
  };

  const getDayStatus = (day: string): { completed: boolean; score?: number } => {
    const dayScore = scores[selectedLessonIndex]?.[day];
    return {
      completed: dayScore !== undefined,
      score: dayScore,
    };
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Choisissez une leçon</h1>
      <p className="text-sm text-gray-600 mb-2">
        Sélectionnez une leçon pour lancer un quiz quotidien.
      </p>

      <div className="bg-blue-50 p-4 rounded mb-6">
        <p className="text-blue-700 text-sm">
          <strong>Info :</strong> Leçon actuelle : <strong>n°{selectedLessonIndex + 1}</strong>. 
          Vous pouvez revoir d’autres leçons si vous le souhaitez.
        </p>
      </div>

      <LessonSelector
        selectedIndex={selectedLessonIndex}
        onChange={setSelectedLessonIndex}
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quiz : {currentLesson.reference}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {daysOfWeek.map(day => {
            const { completed } = getDayStatus(day);
            return (
              <button
                key={day}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                  completed
                    ? 'bg-green-100 text-green-800 border border-green-400'
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
                onClick={() => setActiveDay(day)}
                disabled={completed}
              >
                {day}
                {completed && <span className="text-xs block">(Terminé)</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-3">📉 Historique de vos scores</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          {daysOfWeek.map(day => {
            const score = getDayStatus(day).score;
            return (
              <li key={day}>
                {day} : {score !== undefined ? `${score} / 5` : 'Non tenté'}
              </li>
            );
          })}
        </ul>
      </div>

      {activeDay && (
        <QuizModal
          lessonTitle={currentLesson.title}
          day={activeDay}
          onClose={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default QuizPage;
..