# docs/spec.md -- gabarit de départ, à compléter au fil des étapes

# [ ] étape non franchie (normal en cours de route) [~] garde : ne doit

jamais être faux NON MESURABLE : on ne peut pas trancher, à compter à part

# Spec Finder - Sprint 1 [MINIMAL]

Équipe : ... Version : v1 du AAAA-MM-JJ (étape 1)
Règle : relue au début de chaque séance ; chaque amendement est daté dans le
journal.

## Étape 1 - en mémoire

[✓] npm run dev démarre sans erreur -> le terminal affiche
l'adresse du serveur
[✓] GET /health -> 200, {"ok":true}
[ ] Kit chargé une seule fois au démarrage -> readFileSync hors des
routes
[✓] GET /hotels -> 200, tableau de 3 hôtels
[✓] GET /hotels/:id -> 200 la fiche, ou 404 avec
corps JSON
[✓] GET /chambres -> 200, tableau de 32
chambres
[✓] GET /chambres/:id -> 200 la fiche, ou 404 avec
corps JSON
[✓] req.params.id converti avec Number() -> /hotels/1 répond 200,
/hotels/abc répond 404
[✓] .env avec PORT et DATABASE_URL -> le fichier existe, il
n'est pas commité
[✓] README.md et api/.env.example -> un camarade démarre sans
poser de question
[✓] GET /chambres?prix_max=89 -> 200, 12 chambres ; sans
critère, 32
M. Frébourg · SLAM · SIO2 · Projet 3005 · Finder · v 2026-10-14 Page 19 / 133

## Étapes 2 à 9 - déclarées, non franchies

[✓] E2 Base MySQL via Prisma : schéma, migration, seed du kit -> tables
visibles dans Adminer
[✓] E3 Recherche : hôtel, capacité, prix, catégorie -> GET
/chambres?... filtre
[✓] E4 Recherche : écarter les chambres déjà réservées -> les
dates excluent la chambre 4
[✓] E5 Inscription, connexion JWT 24 h, écritures protégées -> sans
jeton 401, mauvais rôle 403
[✓] E6 Validation Zod [ACCEPTABLE] -> corps
invalide 400, jamais 500
[✓] E7 Réservations et statuts ->
en_attente, confirmee, refusee, annulee
[✓] E8 Documentation Swagger de toutes les routes -> /docs
les affiche toutes
[✓] E9 Tests et recette -> npm test
passe, TA-001 à TA-010

# Spec Finder - Sprint 2 [MINIMAL/ACCEPTABLE]

Version : v2 du 2026-11-02 (sprint 2, étape 1)

## Sprint 2 - Étapes 1 à 6 - déclarées, non franchies

[ ] S2 E1 Projet Vite + React et première fiche en props -> page « Amor » avec
adresse et description, sans erreur en console
[ ] S2 E2 Liste, état local et liste vide -> 12 chambres en liste, message si
vide, clic sur 104 affiche son détail
[ ] S2 E3 Page de recherche : formulaire et appel de l'API -> six critères,
GET /chambres (32 sans critère), chargement et erreur sans page blanche
[ ] S2 E4 Pages, navigation, jeton et routes protégées -> cinq pages sans
rechargement, jeton en mémoire, /mes-reservations déconnecté renvoie à
/connexion
[ ] S2 E5 Réserver, annuler, écran à jour -> POST /reservations en_attente
sans double envoi, annulation visible sans F5
[ ] S2 E6 Migration TypeScript, blocs 1 à 3 [ACCEPTABLE] -> npx tsc --noEmit
passe, un type par entité, aucun any non justifié

## Gardes

[~] Aucun secret dans le dépôt : .env est dans .gitignore
[~] Aucune route ne répond 500 sur un id inconnu ou mal formé
[~] Toute erreur a un corps JSON de la même forme : { "erreur": "..." }

## Non mesurable

NON MESURABLE Temps de réponse de la recherche : pas de jeu de données
assez grand pour trancher

## Journal

2026-09-10 ... création v1, étape 1
2026-11-02 ... début sprint 2, étape 1
2026-11-02 ... v2 : déclaration des six étapes du sprint 2 (non cochées)
