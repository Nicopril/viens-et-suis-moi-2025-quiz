// src/services/rankingService.ts
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

interface ScoreEntry {
  userId: string;
  totalScore: number;
}

export const getWeeklyRanking = async (
  lessonId: number
): Promise<ScoreEntry[]> => {
  const snapshot = await getDocs(collection(db, "scores"));
  const ranking: ScoreEntry[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const lessonScores = data[lessonId];

    if (lessonScores) {
      const total = Object.values(lessonScores).reduce(
        (sum: number, score: any) => sum + (typeof score === "number" ? score : 0),
        0
      );

      ranking.push({
        userId: doc.id,
        totalScore: total,
      });
    }
  });

  return ranking.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
};
