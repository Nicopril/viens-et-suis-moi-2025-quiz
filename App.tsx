
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import Header from './components/Header';
import Footer from './components/Footer';

const AppContent: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/quiz" 
            element={user ? <QuizPage /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </UserProvider>
  );
};

export default App;
