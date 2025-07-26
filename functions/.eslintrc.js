// functions/.eslintrc.js

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // Règles de quotes et d'indentation que ESLint n'arrive pas à fixer (ou qui sont réintroduites)
    "quotes": "off", // Désactive la règle sur les guillemets
    "indent": "off", // Désactive la règle sur l'indentation
    "object-curly-spacing": "off", // Désactive la règle sur les espaces dans les accolades

    // Laissez celle-ci si elle n'est pas déjà présente
    "import/no-unresolved": 0,

    // Règle max-len - Assouplie pour contourner le problème des longues chaînes de caractères
    "max-len": [
      "error",
      {
        "code": 120, // Augmente la limite de caractères à 120 (peut être ajusté plus si nécessaire)
        "ignorePattern": "^import |^export ",
        "ignoreComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true, // Très important pour votre prompt
        "ignoreTemplateLiterals": true, // Très important pour les backticks
        "ignoreRegExpLiterals": true,
      },
    ],
    // Pour l'erreur 'Newline required at end of file but not found' (eol-last)
    "eol-last": "off", // Désactive la règle sur la ligne vide à la fin du fichier

    // Pour le warning 'Unexpected any' sur les erreurs dans les catch (si vous voulez l'ignorer)
    "@typescript-eslint/no-explicit-any": "off", // Désactive ce warning
  },
};
