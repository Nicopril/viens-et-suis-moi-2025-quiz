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
    "google", // Conserve le style guide Google
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
    // Vos règles existantes
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],

    // LA RÈGLE MAX-LEN QUI CONTOURNE LE PROBLÈME
    "max-len": [
      "error",
      {
        "code": 100, // Autorise jusqu'à 100 caractères par ligne
        "ignorePattern": "^import |^export ", // Ignore les imports/exports
        "ignoreComments": true, // Ignore les commentaires
        "ignoreUrls": true, // Ignore les URLs
        "ignoreStrings": true, // Très important pour votre prompt
        "ignoreTemplateLiterals": true, // Très important pour les backticks
        "ignoreRegExpLiterals": true, // Ignore les regex
      },
    ],
  },
};
