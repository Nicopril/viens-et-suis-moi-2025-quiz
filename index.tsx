import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // <<<--- AJOUTEZ CETTE LIGNE ICI !

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("L'élément racine est introuvable.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
