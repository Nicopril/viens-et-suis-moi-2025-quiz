// src/components/QuizModal.tsx

import React, { useState, useEffect } from 'react';

// --- Types pour le quiz ---
interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface QuizModalProps {
    lessonTitle: string; // ex: "Doctrine et Alliances 1" (la référence complète)
    chapterReference: string; // La même référence, utilisée pour la requête Gemini
    day: string; // "Lundi", "Mardi", etc.
    onClose: (score: number | null) => void; // score: null si annulé, number si terminé
}

const QuizModal: React.FC<QuizModalProps> = ({ lessonTitle, chapterReference, day, onClose }) => {
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<({ [key: number]: string | null })>({}); // Stocke la réponse sélectionnée par l'utilisateur pour chaque question
    const [showResults, setShowResults] = useState<boolean>(false); // Pour afficher les résultats finaux

    // CSS de base pour le modal (vous pouvez l'intégrer dans index.css ou un fichier de style dédié)
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalContentStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    // Fonction pour charger les questions via la Netlify Function
    useEffect(() => {
        const fetchQuizQuestions = async () => {
            setLoading(true);
            setError(null);
            setQuizQuestions([]);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setShowResults(false);

            try {
                // Le "chapter" sera la référence complète de la leçon
                // Le "theme" peut être une description générale pour le quiz quotidien
                const response = await fetch('/.netlify/functions/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chapter: chapterReference, theme: `Quiz quotidien du ${day}` }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Détails de l\'erreur non disponibles.' }));
                    throw new Error(`Échec de la récupération du quiz: ${response.status} - ${errorData.error || 'Erreur inconnue.'}`);
                }

                const data: Question[] = await response.json();
                if (data && Array.isArray(data) && data.length > 0) {
                    setQuizQuestions(data);
                } else {
                    setError('Aucune question générée ou format inattendu. Veuillez réessayer.');
                    console.error('Réponse API inattendue:', data);
                }
            } catch (err: any) {
                console.error('Erreur lors du chargement des questions du quiz:', err);
                setError(`Erreur: ${err.message}. Impossible de générer le quiz. Veuillez réessayer.`);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizQuestions();
    }, [chapterReference, day]); // Re-déclencher si la leçon ou le jour change

    const handleAnswerSelect = (questionIndex: number, selectedOption: string) => {
        // Permet de sélectionner une réponse une seule fois par question
        if (userAnswers[questionIndex] === undefined) {
            setUserAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
        }
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Toutes les questions ont été répondues, passer aux résultats
            calculateAndShowResults();
        }
    };

    const calculateScore = () => {
        let correctCount = 0;
        quizQuestions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });
        return correctCount;
    };

    const calculateAndShowResults = () => {
        const score = calculateScore();
        setShowResults(true);
        // Passe le score au composant parent (QuizPage)
        onClose(score);
    };

    // Pour fermer le modal sans score (ex: si l'utilisateur annule)
    const handleCloseModal = () => {
        onClose(null);
    };

    if (loading) {
        return (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle} className="text-center">
                    <p className="text-lg font-semibold text-blue-700">Chargement des questions pour le quiz de {day} ({lessonTitle})...</p>
                    <div className="spinner mt-4" style={{ border: '4px solid rgba(0, 0, 0, 0.1)', borderTop: '4px solid #007bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '20px auto' }}></div>
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <p className="text-red-600 font-semibold mb-4">Erreur: {error}</p>
                    <button onClick={handleCloseModal} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Fermer</button>
                </div>
            </div>
        );
    }

    if (quizQuestions.length === 0 && !loading && !error) {
        return (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <p className="text-gray-700 mb-4">Impossible de générer le quiz pour le moment. Veuillez réessayer plus tard.</p>
                    <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Fermer</button>
                </div>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const hasAnsweredCurrentQuestion = userAnswers[currentQuestionIndex] !== undefined && userAnswers[currentQuestionIndex] !== null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                {!showResults ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">Quiz {day} : {lessonTitle}</h2>
                        <p className="mb-4 text-gray-600">Question {currentQuestionIndex + 1} / {quizQuestions.length}</p>
                        <p className="text-lg font-medium mb-6">{currentQuestion.question}</p>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = userAnswers[currentQuestionIndex] === option;
                                const isCorrect = option === currentQuestion.correctAnswer;
                                const buttonClass = `w-full text-left p-3 rounded-md transition-colors duration-200 ${
                                    hasAnsweredCurrentQuestion
                                        ? (isSelected
                                            ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                            : (isCorrect ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800 opacity-70 cursor-not-allowed')
                                        )
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                                        className={buttonClass}
                                        disabled={hasAnsweredCurrentQuestion}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                        {hasAnsweredCurrentQuestion && (
                            <div className={`mt-4 text-lg font-semibold ${userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                                {userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer
                                    ? 'Correct !'
                                    : `Faux. La bonne réponse était : "${currentQuestion.correctAnswer}"`
                                }
                            </div>
                        )}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={goToNextQuestion}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={!hasAnsweredCurrentQuestion}
                            >
                                {currentQuestionIndex === quizQuestions.length - 1 ? 'Voir les résultats' : 'Question Suivante'}
                            </button>
                        </div>
                    </>
                ) : (
                    // Affichage des résultats finaux
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-blue-700">Quiz Terminé !</h2>
                        <p className="text-xl mb-6 text-gray-800">Votre score : <span className="font-extrabold text-green-600">{calculateScore()}</span> / {quizQuestions.length}</p>
                        <button onClick={handleCloseModal} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizModal;