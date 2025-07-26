
import React from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useUser();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold text-sky-700 hover:text-sky-800 transition-colors">
          Viens et Suis-Moi Quiz 2025
        </Link>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 hidden sm:inline">Bonjour, {user.name} !</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
