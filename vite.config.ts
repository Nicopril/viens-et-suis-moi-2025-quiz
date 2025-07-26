import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Important pour les déploiements Netlify
  build: {
    outDir: 'dist', // Dossier de sortie
  },
  // N'ajoutez PAS le bloc 'define' pour les variables d'environnement VITE_
});
