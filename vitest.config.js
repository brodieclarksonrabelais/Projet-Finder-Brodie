export default {
  test: {
    globals: true,
    // describe, it et expect disponibles sans les importer, comme avec Jest.
    // Sans cette ligne, chaque fichier de test doit commencer par import { describe, it, expect }
    // from 'vitest'
    environment: "node",
    // pas de DOM : on teste une API. Les tests d'interface demandent jsdom (chapitre Tests)
  },
};
