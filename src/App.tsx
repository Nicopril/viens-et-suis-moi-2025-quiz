// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Assurez-vous que ce chemin est correct
import HomePage from './pages/HomePage'; // Votre page d'accueil existante
import QuizPage from './pages/QuizPage'; // Votre QuizPage existante
import Header from './components/Header'; // Importez le composant Header
import Footer from './components/Footer'; // Importez le composant Footer

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider> 
        {/* Utilisation de flex-col et flex-grow pour que le footer reste en bas */}
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
          <Header /> {/* Rendu du Header en haut de toutes les pages */}
          <main className="container mx-auto px-4 py-8 flex-grow"> {/* main prend l'espace restant */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              {/* Ajoutez d'autres routes ici si vous en avez */}
            </Routes>
          </main>
          <Footer /> {/* Rendu du Footer en bas de toutes les pages */}
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;
