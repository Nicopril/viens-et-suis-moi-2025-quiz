// src/App.tsx (Ne change pas)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Assurez-vous que ce chemin est correct
import HomePage from './pages/HomePage'; // Votre page d'accueil existante
import QuizPage from './pages/QuizPage'; // Votre QuizPage existante

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider> 
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizPage />} />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;
