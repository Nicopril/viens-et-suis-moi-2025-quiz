// ✅ storageService.ts avec normalisation du nom d’utilisateur
import { collection, getDocs, addDoc, query, where, getFirestore, Timestamp, writeBatch, limit } from 'firebase/firestore';
import { app } from './firebase';
import { User, ScoreEntry, WeeklyWinner, CompletedQuizzes } from '../types';

const db = getFirestore(app);

const USERS_COLLECTION = 'users';
const SCORES_COLLECTION = 'scores';
const WINNERS_COLLECTION = 'weeklyWinners';

const getWeekInfo = (d: Date): { weekNumber: number, year: number } => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { weekNumber, year };
};

// ✅ Gestion des utilisateurs avec normalisation
type FirestoreUser = {
  name: string;
  normalizedName: string;
};

export const findOrCreateUser = async (name: string): Promise<User> => {
  const normalizedName = name.trim().toLowerCase();
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("normalizedName", "==", normalizedName));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } else {
    const newUser: FirestoreUser = { name, normalizedName };
    const docRef = await addDoc(usersRef, newUser);
    return { id: docRef.id, ...newUser };
  }
};

export const saveUserToSession = (user: User): void => {
  sessionStorage.setItem('vsm_quiz_user', JSON.stringify(user));
};

export const getUserFromSession = (): User | null => {
  const userJson = sessionStorage.getItem('vsm_quiz_user');
  return userJson ? JSON.parse(userJson) : null;
};

export const clearUserFromSession = (): void => {
  sessionStorage.removeItem('vsm_quiz_user');
};

export const addScore = async (user: User, lessonId: number, day: string, score: number): Promise<void> => {
  const scoreEntry: Omit<ScoreEntry, 'id'> = {
    userId: user.id,
    name: user.name,
    score,
    lessonId,
    day,
    date: Timestamp.now(),
  };
  await addDoc(collection(db, SCORES_COLLECTION), scoreEntry);
};

export const getCompletedQuizzes = async (user: User): Promise<CompletedQuizzes> => {
  const scoresRef = collection(db, SCORES_COLLECTION);
  const q = query(scoresRef, where("userId", "==", user.id));
  const querySnapshot = await getDocs(q);

  const completed: CompletedQuizzes = {};
  querySnapshot.forEach(doc => {
    const data = doc.data() as ScoreEntry;
    if (!completed[data.lessonId]) {
      completed[data.lessonId] = [];
    }
    completed[data.lessonId].push(data.day);
  });
  return completed;
};

export const getUserScores = async (user: User): Promise<ScoreEntry[]> => {
  const scoresRef = collection(db, SCORES_COLLECTION);
  const q = query(scoresRef, where("userId", "==", user.id));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as ScoreEntry),
  }));
};

export const getLatestWinner = async (): Promise<WeeklyWinner | null> => {
  const winnersRef = collection(db, WINNERS_COLLECTION);
  const q = query(winnersRef, limit(1));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].data() as WeeklyWinner;
};

export const checkAndResetForNewWeek = async (): Promise<void> => {
  const { weekNumber: currentWeek, year: currentYear } = getWeekInfo(new Date());
  const winnersRef = collection(db, WINNERS_COLLECTION);
  const q = query(winnersRef, where("weekNumber", "==", currentWeek), where("year", "==", currentYear));
  const winnerSnapshot = await getDocs(q);
  if (!winnerSnapshot.empty) return;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { weekNumber: lastWeek, year: lastYear } = getWeekInfo(oneWeekAgo);

  const lastWeekWinnerQ = query(winnersRef, where("weekNumber", "==", lastWeek), where("year", "==", lastYear));
  const lastWeekWinnerSnapshot = await getDocs(lastWeekWinnerQ);

  if (lastWeekWinnerSnapshot.empty) {
    console.log(`Calculating winner for week ${lastWeek}, ${lastYear}`);

    const startOfWeek = new Date(oneWeekAgo);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const scoresRef = collection(db, SCORES_COLLECTION);
    const scoresQuery = query(scoresRef, where('date', '>=', Timestamp.fromDate(startOfWeek)), where('date', '<=', Timestamp.fromDate(endOfWeek)));

    const scoresSnapshot = await getDocs(scoresQuery);
    if (scoresSnapshot.empty) {
      console.log("No scores recorded last week.");
      return;
    }

    const totals = new Map<string, { score: number, name: string }>();
    scoresSnapshot.forEach(doc => {
      const score = doc.data() as ScoreEntry;
      const current = totals.get(score.userId) || { score: 0, name: score.name };
      current.score += score.score;
      totals.set(score.userId, current);
    });

    if (totals.size > 0) {
      let winner = { name: '', score: -1 };
      totals.forEach((value) => {
        if (value.score > winner.score) {
          winner = value;
        }
      });

      const winnerData: WeeklyWinner = {
        ...winner,
        weekNumber: lastWeek,
        year: lastYear,
      };
      await addDoc(winnersRef, winnerData);
      console.log("Winner calculated and saved:", winnerData);
    }
  }
};