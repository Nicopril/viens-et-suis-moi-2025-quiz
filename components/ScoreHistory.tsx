import React, { useEffect, useState } from 'react';
import { ScoreEntry } from '../types';
import { getUserScores } from '../services/storageService';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ScoreHistory: React.FC = () => {
  const { user } = useUser();
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    if (user) {
      getUserScores(user).then(setScores).catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mt-8">
      <h2 className="text-2xl font-bold text-sky-800 mb-4">📈 Historique de vos scores</h2>
      {scores.length === 0 ? (
        <p className="text-slate-500">Vous n’avez encore complété aucun quiz.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {scores
            .sort((a, b) => b.date.seconds - a.date.seconds)
            .map((score) => (
              <li key={score.id} className="py-3">
                <p className="text-slate-700">
                  📘 Leçon {score.lessonId} - <strong>{score.day}</strong> : <span className="font-bold">{score.score} pts</span>
                </p>
                <p className="text-sm text-slate-400">
                  {format(score.date.toDate(), "EEEE d MMMM yyyy", { locale: fr })}
                </p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default ScoreHistory;
