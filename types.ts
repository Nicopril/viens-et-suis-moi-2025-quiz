export interface User {
  id: string;
  name: string;
}

export interface Lesson {
  id: number;
  title: string;
  reference: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  reference: string;
}

export interface ScoreEntry {
  userId: string;
  name: string;
  score: number;
  lessonId: number;
  day: string;
  date: any; // Firestore Timestamp
}

export interface WeeklyWinner {
  name: string;
  score: number;
  weekNumber: number;
  year: number;
}

export interface CompletedQuizzes {
  [lessonId: string]: string[]; // e.g. { '29': ['Lundi', 'Mardi'] }
}