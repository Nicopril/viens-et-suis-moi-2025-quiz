// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Le composant App qui gère le routage et les contextes
import './index.css'; // Votre fichier CSS global (assurez-vous qu'il est dans src/)

// Retirez toutes les importations de Firebase ici :
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// Retirez toute la configuration et l'initialisation de Firebase ici :
// const firebaseConfig = {...};
// const firebaseApp = initializeApp(firebaseConfig);
// export const db = getFirestore(firebaseApp);
// export const auth = getAuth(firebaseApp);
// console.log('Firebase App initialisée avec succès !'); // Ce log sera désormais dans src/services/firebase.ts


// Le reste du fichier reste le même
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