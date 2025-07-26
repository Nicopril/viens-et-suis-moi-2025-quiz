// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Le composant App qui gère le routage et les contextes
import './index.css'; // Votre fichier CSS global
import { initializeApp } from 'firebase/app'; // Importez Firebase ici

// --- CONFIGURATION FIREBASE ---
// Accès aux variables d'environnement via import.meta.env (spécifique à Vite)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

// Initialisation de l'application Firebase (une seule fois pour toute l'application)
const firebaseApp = initializeApp(firebaseConfig);
console.log('Firebase App initialisée avec succès !');

// Si vous avez besoin d'autres services Firebase globalement, initialisez-les ici:
// export const db = getFirestore(firebaseApp);
// export const auth = getAuth(firebaseApp);


// --- MONTAGE DE L'APPLICATION REACT ---
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