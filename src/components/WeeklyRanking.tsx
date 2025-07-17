// src/components/WeeklyRanking.tsx
import React, { useEffect, useState } from "react";
import { getWeeklyRanking } from "../services/rankingService";

interface WeeklyRankingProps {
  lessonId: number;
}

const WeeklyRanking: React.FC<WeeklyRankingProps> = ({ lessonId }) => {
  const [ranking, setRanking] = useState<{ userId: string; totalScore: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWeeklyRanking(lessonId)
      .then(setRanking)
      .finally(() => setLoading(false));
  }, [lessonId]);

  return (
    <div className="mt-10 p-4 border border-sky-200 bg-sky-50 rounded-xl">
      <h2 className="text-lg font-bold mb-4">🏆 Classement hebdomadaire</h2>
      {loading ? (
        <p className="text-sm text-gray-600">Chargement en cours...</p>
      ) : ranking.length === 0 ? (
        <p className="text-sm text-gray-600">Aucun score pour cette semaine.</p>
      ) : (
        <ol className="list-decimal pl-5 space-y-1 text-slate-800 text-sm">
          {ranking.map((entry, i) => (
            <li key={entry.userId}>
              Utilisateur <strong>{entry.userId.slice(0, 6)}...</strong> —{" "}
              <strong>{entry.totalScore} pts</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default WeeklyRanking;
