
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { getLatestWinner } from '../services/storageService';
import { WeeklyWinner } from '../types';
import TrophyIcon from '../components/icons/TrophyIcon';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');
  const { user, login, isLoading } = useUser();
  const navigate = useNavigate();
  const [winner, setWinner] = useState<WeeklyWinner | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/quiz');
    }
  }, [user, navigate]);

  useEffect(() => {
    getLatestWinner().then(setWinner).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isLoading) {
      await login(name.trim());
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-4xl font-extrabold text-sky-700 mb-4">Bienvenue au Quiz "Viens et Suis-Moi" !</h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600">
          Ce site est conçu pour vous aider à approfondir votre étude du programme "Viens et Suis-Moi" 2025.
          Chaque semaine, testez vos connaissances avec des quiz quotidiens et participez à une compétition amicale pour le meilleur score.
        </p>
      </section>

      <section className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <img src="https://assets.churchofjesuschrist.org/media/4/8/48b48f682d3381a1a55f9a562496a77196010537/russell_m_nelson_official_portrait_2018.jpeg" alt="Président Russell M. Nelson" className="w-32 h-32 rounded-full object-cover shadow-md" />
                <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-700">
                    <p>« Je vous exhorte à aller au-delà de votre capacité spirituelle actuelle de recevoir la révélation personnelle, car le Seigneur a promis que ‘si tu cherches, tu recevras révélation sur révélation, connaissance sur connaissance, afin que tu connaisses les mystères et les choses paisibles, ce qui apporte la joie, ce qui apporte la vie éternelle’ (D&A 42:61). »</p>
                    <cite className="block mt-2 font-semibold not-italic">- Russell M. Nelson, « Révélation pour l’Église, révélation pour notre vie »</cite>
                </blockquote>
            </div>
        </div>
      </section>
      
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-4 text-sky-800">Participez au Concours !</h2>
          <p className="text-center text-slate-500 mb-6">Inscrivez votre nom pour commencer et enregistrer vos scores.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Votre Nom ou Prénom</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-wait"
            >
              {isLoading ? 'Connexion...' : 'Commencer le quiz'}
            </button>
          </form>
        </section>

        <section className="bg-gradient-to-br from-amber-300 to-yellow-400 p-8 rounded-xl shadow-lg text-yellow-900">
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
            <h2 className="text-2xl font-bold text-center mt-4 mb-2">Dernier Gagnant</h2>
            {winner ? (
              <div className="space-y-1">
                <p className="text-3xl font-bold">{winner.name}</p>
                <p className="text-lg font-medium">avec un score de <span className="font-extrabold">{winner.score}</span> points !</p>
                <p className="text-sm opacity-80">(Semaine {winner.weekNumber} de {winner.year})</p>
              </div>
            ) : (
              <p className="text-lg mt-4">Le premier concours est en cours ! Soyez le premier gagnant !</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;