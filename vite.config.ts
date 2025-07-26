import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 1. Importez le plugin React !
// import path from 'path'; // Le chemin n'est pas nécessaire si l'alias '@' n'est plus utilisé ou s'il est ajusté

export default defineConfig({
    // 2. Ajoutez le plugin React ici
    plugins: [react()], 

    // 3. Ajoutez la propriété 'base' pour les chemins absolus lors du déploiement
    base: '/', 

    // 4. Configurez le dossier de sortie pour le build
    build: {
        outDir: 'dist', // Par défaut, mais bonne pratique de l'expliciter
    },

    // 5. SUPPRIMEZ le bloc 'define' car il est obsolète pour les variables d'environnement VITE_
    // et peut réintroduire l'erreur "process is not defined".
    // Vite expose automatiquement les variables d'environnement préfixées par VITE_
    // via 'import.meta.env' dans votre code client.
    
    // Si vous aviez d'autres alias ou résolutions spécifiques non liés à 'process.env', vous pourriez les garder ici :
    // resolve: {
    //   alias: {
    //     '@': path.resolve(__dirname, 'src'), // Si vous voulez que '@' pointe vers votre dossier src
    //   }
    // }
    // Pour l'instant, je le commente car il n'est pas directement pertinent pour l'erreur actuelle.
    // Si vous avez des importations comme `import MyComponent from '@/components/MyComponent';`
    // et que '@/components' pointe vers `src/components`, alors vous voudriez `path.resolve(__dirname, 'src')`
});
