finder/
├── README.md ← onboarding < 10 lignes
├── LICENSE ← MIT
├── docker-compose.yml ← BONUS (Docker, facultatif)
├── .gitignore ← node_modules/ et .env, sans barre oblique
: couvre api/.env
├── docs/ ← détaillé plus bas
├── .github/
│ └── workflows/
│ └── ci.yml ← BONUS, lint + tsc + tests + build
│ (jamais exigé)
Bloc 2 - Backend api/ (Express + Prisma + tests) :

├── api/
│ ├── Dockerfile ← BONUS (Docker, facultatif)
│ ├── tsconfig.json
│ ├── package.json
│ ├── .env.example ← mêmes clés que .env, valeurs vides (sprint
1, Q9)
│ ├── finder-data/ ← le kit du depot de cours, copie tel quel
(sprint 1, Q6), jamais modifie
│ │ └── hotels.json, chambres.json, comptes.json, reservations.json,
README.md
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── migrations/
│ ├── src/
│ │ ├── app.ts
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── middleware/ ← auth, rate-limit (role-check = bonus)
│ │ ├── types/ ← types partagés
│ │ └── utils/
│ └── tests/
│ ├── auth.test.ts
│ ├── chambres.test.ts
│ ├── reservations.test.ts
│ ├── rgpd.test.ts ← avancé
│ └── admin.test.ts ← bonus
Bloc 3 - Front React + scripts d'exploitation :
M. Frébourg · SLAM · SIO2 · Projet 3005 · Finder · v 2026-09-08 Page 95 / 100

├── front/
│ ├── Dockerfile ← BONUS (Docker, facultatif)
│ ├── tsconfig.json
│ ├── vite.config.ts
│ ├── package.json
│ └── src/
│ ├── App.tsx
│ ├── pages/
│ ├── components/
│ ├── hooks/
│ └── tests/ ← BONUS, React Testing Library
└── scripts/
└── install.sh ← BONUS, deploiement VM Ubuntu
Et le dossier finder/docs/ - pièce maîtresse du dossier E6, à la racine du dépôt, à côté de api/ :

finder/docs/
├── spec.md ← la spec du sprint 1 (Q1), cases cochées et
journal daté au fil des étapes
├── mcd.png + mld.md
├── uml-cas.png
├── uml-sequence-auth.png
├── uml-classes.png ← bienvenu, pas exigé
├── architecture.md ← une page avec schéma, écrite une fois au
sprint 4 (E6)
├── decisions/ ← une décision par fichier, forme ADR : 0001-
front-separe.md, 0002, 0003
├── runbook.md ← 3 procédures opé
├── dumps/ ← les dumps de la procédure 2 du RUNBOOK (sprint
4, étape 5), jamais commités
├── securite.md ← OWASP point par point (avancé)
├── rgpd/
│ ├── registre.md ← gabarit CNIL rempli
│ ├── politique.md ← politique de confidentialité
│ └── droits.md ← procédures droits utilisateurs
├── manuel-voyageur.md ← DOC UTILISATEUR (2-3 p.)
├── captures/manuel/ ← screens illustrant le manuel
├── recette.md ← tests d'acceptation TA-001 à TA-016
├── ia-journal.md ← journal IA + rétro, par sprint
├── seances.md ← le journal de séances (mémo 306 : une entrée par séance)
├── licences-audit.md ← npx license-checker commenté
├── guide-hotelier.md ← BONUS (1 p.)
└── accessibilite.md ← BONUS, audit WAVE/Lighthouse
finder/openapi.yaml ← Swagger pour devs front, à la racine du dépôt