// src/index.tsx (ou src/main.tsx)

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // Utilisation de createRoot pour React 18+
import { initializeApp } from 'firebase/app';
// Si vous utilisez d'autres services Firebase (Firestore, Auth, etc.), importez-les ici :
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// --- Types pour le quiz ---
interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase App initialisée avec succès !');

// Si vous avez besoin d'autres services, initialisez-les ici :
// const db = getFirestore(app);
// const auth = getAuth(app);

// --- COMPOSANT REACT PRINCIPAL ---
const App: React.FC = () => {
    const [chapter, setChapter] = useState<string>('Doctrine et Alliances 1');
    const [theme, setTheme] = useState<string>('La révélation moderne');
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});

    // Fonction pour appeler la Netlify Function
    const generateQuizFromGemini = async () => {
        setLoading(true);
        setError(null);
        setQuizQuestions([]);
        setSelectedAnswers({});

        if (!chapter || !theme) {
            setError('Veuillez entrer un chapitre et un thème pour générer le quiz.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chapter, theme }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Détails de l\'erreur non disponibles' }));
                throw new Error(`Échec de la récupération du quiz: ${response.status} - ${errorData.error || JSON.stringify(errorData)}`);
            }

            const data: Question[] = await response.json();
            setQuizQuestions(data);
        } catch (err: any) {
            console.error('Erreur lors de la génération du quiz:', err);
            setError(`Erreur: ${err.message}. Impossible de générer le quiz. Veuillez réessayer.`);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionClick = (questionIndex: number, selectedOption: string) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
    };

    return (
        <div className="p-5">
            <h1 className="text-3xl font-bold mb-4 text-blue-700">Quiz sur "Viens et Suis-moi 2025 - Doctrine et Alliances"</h1>
            <p className="mb-4 text-gray-700">Générez des questions de quiz en spécifiant un chapitre et un thème.</p>

            <div className="mb-4">
                <label htmlFor="chapterInput" className="block text-sm font-medium text-gray-700">Chapitre (ex: D&A 1):</label>
                <input
                    type="text"
                    id="chapterInput"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="themeInput" className="block text-sm font-medium text-gray-700">Thème (ex: La révélation moderne):</label>
                <input
                    type="text"
                    id="themeInput"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                />
            </div>

            <button
                onClick={generateQuizFromGemini}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
            >
                {loading ? 'Génération...' : 'Générer un Quiz'}
            </button>

            {loading && (
                <div className="mt-4 p-3 rounded-md bg-yellow-100 text-yellow-800">
                    Chargement des questions...
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 rounded-md bg-red-100 text-red-800">
                    {error}
                </div>
            )}

            <div id="quizContainer" className="mt-8">
                {quizQuestions.length > 0 && (
                    <h2 className="text-2xl font-bold mb-4 text-green-700">Questions du Quiz :</h2>
                )}
                {quizQuestions.map((q, index) => (
                    <div key={index} className="bg-gray-100 p-5 rounded-lg shadow-sm mb-6">
                        <h3 className="text-xl font-semibold mb-3">Question {index + 1}: {q.question}</h3>
                        <ul className="list-none p-0">
                            {q.options.map((option, optIndex) => (
                                <li key={optIndex} className="mb-2">
                                    <button
                                        onClick={() => handleOptionClick(index, option)}
                                        className={`w-full text-left p-3 rounded-md transition-colors duration-200
                                            ${selectedAnswers[index] === option
                                                ? (option === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            }
                                            ${selectedAnswers[index] !== undefined ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                                        `}
                                        disabled={selectedAnswers[index] !== undefined}
                                    >
                                        {option}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {selectedAnswers[index] !== undefined && (
                            <div className={`mt-3 font-semibold ${selectedAnswers[index] === q.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                                {selectedAnswers[index] === q.correctAnswer
                                    ? 'Correct !'
                                    : `Faux. La bonne réponse était : "${q.correctAnswer}"`
                                }
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Montage de l'application React dans le DOM
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("L'élément 'root' n'a pas été trouvé dans le HTML.");
}
