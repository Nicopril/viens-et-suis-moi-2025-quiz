import React, { useState, useEffect, useCallback } from 'react';
import { LESSONS_2025, CURRENT_LESSON_ID, DAYS_OF_WEEK } from '../constants';
import { Lesson, CompletedQuizzes } from '../types';
import QuizModal from '../components/QuizModal';
import * as firestoreService from '../services/storageService';
import { useUser } from '../contexts/UserContext';
import ScoreHistory from '../components/ScoreHistory';
import React, { useState } from 'react';
import LessonSelector from '../components/LessonSelector';
import { lessons } from '../data/lessons';

const Home = () => {
  const [lessonId, setLessonId] = useState(1);
  const [selectedDay, setSelectedDay] = useState("Lundi"); // ou autre gestion

  const handleGenerateQuiz = async () => {
    const lessonTitle = lessons.find((l) => l.id === lessonId)?.title;
    const body = JSON.stringify({ lessonTitle, day: selectedDay });

    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <LessonSelector selectedLessonId={lessonId} onChange={setLessonId} />
      <button onClick={handleGenerateQuiz} className="btn-primary">
        🎯 Générer le quiz
      </button>
    </div>
  );
};

export default Home;

const QuizPage: React.FC = () => {
  const { user } = useUser();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ lesson: Lesson, day: string } | null>(null);
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
        console.error("Failed to load completed quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadCompletedQuizzes();
  }, [loadCompletedQuizzes]);

  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lessonId = parseInt(e.target.value, 10);
    const lesson = LESSONS_2025.find(l => l.id === lessonId);
    setSelectedLesson(lesson || null);
  };

  const handleStartQuiz = (day: string) => {
    if (selectedLesson) {
      setActiveQuiz({ lesson: selectedLesson, day });
    }
  };

  const handleCloseQuiz = async (score: number | null) => {
    if (user && activeQuiz && score !== null) {
      await firestoreService.addScore(user, activeQuiz.lesson.id, activeQuiz.day, score);
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
          lessonTitle={activeQuiz.lesson.title}
          day={activeQuiz.day}
          onClose={handleCloseQuiz}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-sky-800 mb-2">Choisissez une leçon</h1>
        <p className="text-slate-500 mb-6">
          Sélectionnez une leçon dans la liste déroulante pour afficher les quiz quotidiens.
        </p>

        <div className="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-r-lg mb-6">
          <p className="text-sky-800">
            <span className="font-bold">Info :</span> Nous étudions actuellement la{' '}
            <span className="font-semibold">Leçon {CURRENT_LESSON_ID}</span> cette semaine.
            N'hésitez pas à revisiter les leçons précédentes pour vous entraîner !
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="lesson-select" className="sr-only">Sélectionner une leçon</label>
          <select
            id="lesson-select"
            value={selectedLesson?.id || ''}
            onChange={handleLessonChange}
            className="w-full p-4 text-lg border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
          >
            {LESSONS_2025.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                Leçon {lesson.id}: {lesson.title} ({lesson.reference})
              </option>
            ))}
          </select>
        </div>

        {selectedLesson && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Quiz pour : {selectedLesson.title}
            </h2>
            {isLoading ? (
              <>
                <div className="text-center p-8">
                  <p>Chargement des quiz...</p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const completed = isQuizCompleted(selectedLesson.id, day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleStartQuiz(day)}
                      disabled={completed}
                      className={`p-6 rounded-lg text-center font-bold text-lg transition-all duration-200 transform
                        ${
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

        {/* Score History visible tout le temps, même en cours de chargement */}
        <div className="mt-10">
          <ScoreHistory />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

