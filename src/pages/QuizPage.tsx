// src/pages/QuizPage.tsx

import React, { useState } from 'react';
import LessonSelector from '../components/LessonSelector';
import QuizModal from '../components/QuizModal'; // Va être modifié
import WeeklyRanking from '../components/WeeklyRanking';
import { lessons } from '../data/lessons'; // Votre fichier lessons.ts
import { useUser } from '../context/UserContext';

const QuizPage: React.FC = () => {
  const { user, scores, markDayAsCompleted } = useUser();
  // selectedLessonIndex est l'ID de la leçon (id: 1, 2, ...), pas l'index du tableau (0, 1, ...)
  // Il est préférable d'utiliser l'index réel du tableau pour les tableaux
  // Assurez-vous que votre LessonSelector retourne un index et non un ID si vous utilisez des tableaux directement
  // Pour l'instant, je vais ajuster pour correspondre à votre logique existante avec lessons.id
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1); // Initialisé à l'ID de la première leçon
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const userProgress = user?.progress || {};

  // Trouver la leçon correcte par son ID
  const currentLesson = lessons.find(lesson => lesson.id === selectedLessonId);

  if (!currentLesson) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Erreur : la leçon sélectionnée (ID {selectedLessonId}) est introuvable.
      </div>
    );
  }

  const handleQuizComplete = (score: number | null) => {
    if (score !== null && activeDay) {
      markDayAsCompleted(currentLesson.id, activeDay, score); // Utilisez currentLesson.id
    }
    setActiveDay(null);
  };

  const getDayStatus = (lessonId: number, day: string) => {
    const lessonProgress = userProgress[lessonId];
    if (!lessonProgress) return { completed: false, score: undefined };
    const dayData = lessonProgress[day];
    return {
      completed: !!dayData,
      score: dayData?.score,
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
          <strong>Info :</strong> Leçon actuelle : <strong>n°{currentLesson.id}</strong>.
        </p>
      </div>

      {/* Le LessonSelector doit passer l'ID de la leçon sélectionnée */}
      <LessonSelector
        selectedIndex={selectedLessonId} // Passe l'ID sélectionné
        onChange={setSelectedLessonId} // Met à jour l'ID sélectionné
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quiz : {currentLesson.reference}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {daysOfWeek.map(day => {
            const { completed } = getDayStatus(currentLesson.id, day); // Utilisez currentLesson.id
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
            const { score } = getDayStatus(currentLesson.id, day); // Utilisez currentLesson.id
            return (
              <li key={day}>
                {day} : {score !== undefined ? `${score} / 5` : 'Non tenté'}
              </li>
            );
          })}
        </ul>
      </div>

      <WeeklyRanking lessonId={currentLesson.id} /> {/* Utilisez currentLesson.id */}

      {activeDay && (
        <QuizModal
          lessonTitle={currentLesson.reference} // Passe la référence complète pour le titre du modal
          chapterReference={currentLesson.reference} // NOUVEAU: Passe la référence pour l'API Gemini
          day={activeDay}
          onClose={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default QuizPage;