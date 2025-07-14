<<<<<<< HEAD
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);

export { app };
=======
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiPF2vxfKU8kK04uKz_3saaJV9NJ6YYFs",
  authDomain: "viens-et-suis-moi-quiz-2025.firebaseapp.com",
  projectId: "viens-et-suis-moi-quiz-2025",
  storageBucket: "viens-et-suis-moi-quiz-2025.firebasestorage.app",
  messagingSenderId: "170003579949",
  appId: "1:170003579949:web:489880a9a6c1688cdd64a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
>>>>>>> 4f27b5556258a7ffbd905069c718315401d50e60
