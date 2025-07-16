import React, { useState, useEffect, useCallback } from 'react';
import { LESSONS_2025, CURRENT_LESSON_ID, DAYS_OF_WEEK } from '../constants';
import { Lesson, CompletedQuizzes } from '../types';
import QuizModal from '../components/QuizModal';
import * as firestoreService from '../services/storageService';
import { useUser } from '../contexts/UserContext';
import ScoreHistory from '../components/ScoreHistory';

const QuizPage: React.FC = () => {
  const { user } = useUser();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ reference: string, day: string } | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuizzes>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentLesson = LESSONS_2025.find(l => l.id === CURRENT_LESSON_ID);
    setSelectedLesson(currentLesson || LESSONS_2025[0]);
  }, []);

  const loadCompletedQuizzes = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const completed = await firestoreService.getCompletedQuizzes(user);
        setCompletedQuizzes(completed);
      } catch (error) {
        console.error("Erreur chargement historique :", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadCompletedQuizzes();
  }, [loadCompletedQuizzes]);

  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    const lesson = LESSONS_2025.find(l => l.id === id);
    setSelectedLesson(lesson || null);
  };

  const handleStartQuiz = (day: string) => {
    if (selectedLesson) {
      setActiveQuiz({ reference: selectedLesson.reference, day });
    }
  };

  const handleCloseQuiz = async (score: number | null) => {
    if (user && activeQuiz && score !== null && selectedLesson) {
      await firestoreService.addScore(user, selectedLesson.id, activeQuiz.day, score);
      await loadCompletedQuizzes();
    }
    setActiveQuiz(null);
  };

  const isQuizCompleted = (lessonId: number, day: string): boolean => {
    return completedQuizzes[lessonId]?.includes(day) ?? false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {activeQuiz && (
        <QuizModal
          reference={activeQuiz.reference}
          day={activeQuiz.day}
          onClose={handleCloseQuiz}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-sky-800 mb-2">Choisissez une leçon</h1>
        <p className="text-slate-500 mb-6">
          Sélectionnez une leçon pour lancer un quiz quotidien.
        </p>

        <div className="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-r-lg mb-6">
          <p className="text-sky-800">
            <span className="font-bold">Info :</span> Leçon actuelle :{' '}
            <span className="font-semibold">n°{CURRENT_LESSON_ID}</span>. Vous pouvez revoir d’autres leçons si vous le souhaitez.
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="lesson-select" className="sr-only">Sélection de la leçon</label>
          <select
            id="lesson-select"
            value={selectedLesson?.id || ''}
            onChange={handleLessonChange}
            className="w-full p-4 text-lg border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
          >
            {LESSONS_2025.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                Leçon {lesson.id}: {lesson.reference}
              </option>
            ))}
          </select>
        </div>

        {selectedLesson && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Quiz : {selectedLesson.reference}
            </h2>
            {isLoading ? (
              <div className="text-center p-8">
                <p>Chargement des quiz complétés...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const completed = isQuizCompleted(selectedLesson.id, day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleStartQuiz(day)}
                      disabled={completed}
                      className={`p-6 rounded-lg text-center font-bold text-lg transition-all duration-200 transform ${
                        completed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed border-2 border-green-300'
                          : 'bg-sky-500 text-white hover:bg-sky-600 hover:scale-105'
                      }`}
                    >
                      {day}
                      {completed && (
                        <span className="block text-sm font-normal mt-1">(Terminé)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-10">
          <ScoreHistory />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

