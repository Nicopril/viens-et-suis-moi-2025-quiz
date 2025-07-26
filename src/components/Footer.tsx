
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500">
        <p>&copy; {currentYear} Viens et Suis-Moi Quiz. Créé avec ❤️ pour l'étude de l'Évangile.</p>
      </div>
    </footer>
  );
};

export default Footer;
