// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  schemaInscription,
  schemaConnexion,
  schemaModifCompte,
  schemaCreationChambre,
  schemaModificationChambre,
  schemaRechercheChambre,
  schemaCreationReservation,
  schemaModificationReservation,
} from "./schemas.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

//////////////////////////////// Middlewares /////////////////////////////////////

//vérification du token JWT et récupération des informations de l'utilisateur
function authRequis(req, res, next) {
  const entete = req.headers.authorization || "";
  const token = entete.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erreur: "jeton absent ou invalide" });
  }
}

// Vérification du rôle de l'utilisateur
function exigeRole(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ erreur: "acces refuse" });
}

// Validation des données d'entrée avec Zod
export function valider(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body ?? {});
    if (!resultat.success) {
      return res.status(400).json({ erreurs: resultat.error.issues });
    }
    req.body = resultat.data;
    next();
  };
}

// Validation des paramètres de requête avec Zod
export function validerQuery(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.query);
    if (!resultat.success) {
      return res.status(400).json({ erreurs: resultat.error.issues });
    }
    req.validatedQuery = resultat.data;
    next();
  };
}

const TRANSITIONS_AUTORISEES = {
  en_attente: ["confirmee", "refusee", "annulee"],
  confirmee: ["annulee"],
  refusee: [],
  annulee: [],
};

// Vérifie si la transition de statut est valide
function transitionValide(statutActuel, statutVoulu) {
  return (TRANSITIONS_AUTORISEES[statutActuel] || []).includes(statutVoulu);
}

//////////////////////////////// GET /////////////////////////////////////

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Le serveur est lancé
 *     tags: [Santé]
 *     responses:
 *       200:
 *         description: Le serveur fonctionne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 */
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * @openapi
 * /hotels:
 *   get:
 *     summary: Récupérer la liste des hôtels
 *     description: Réservé aux hôteliers.
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: La liste des hôtels }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.get("/hotels", authRequis, exigeRole("hotelier"), async (req, res) => {
  res.json(await prisma.hotel.findMany());
});
//app.get("/chambres", (req, res) => res.json(chambres));

/**
 * @openapi
 * /hotel/{id}:
 *   get:
 *     summary: Récupérer les détails d'un hôtel
 *     description: Réservé aux hôteliers.
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de l'hôtel
 *     responses:
 *       200: { description: L'hôtel demandé }
 *       400: { description: L'id doit être un nombre entier }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 *       404: { description: Hotel introuvable }
 */
app.get("/hotel/:id", authRequis, exigeRole("hotelier"), async (req, res) => {
  const { id } = Number(req.params);
  const hotel = await prisma.hotel.findUnique({ where: { id: Number(id) } });
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  if (!hotel) return res.status(404).json({ erreur: "Hotel introuvable" });
  res.json(hotel);
});

/**
 * @openapi
 * /chambre/{id}:
 *   get:
 *     summary: Récupérer les détails d'une chambre
 *     description: Réservé aux hôteliers.
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de la chambre
 *     responses:
 *       200: { description: La chambre demandée }
 *       400: { description: L'id doit être un nombre entier }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 *       404: { description: Chambre introuvable }
 */
app.get("/chambre/:id", authRequis, exigeRole("hotelier"), async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }

  const chambre = await prisma.chambre.findUnique({ where: { id } });
  if (!chambre) return res.status(404).json({ erreur: "Chambre introuvable" });
  res.json(chambre);
});

/**
 * @openapi
 * /hotels/{id}/chambres:
 *   get:
 *     summary: Récupérer la liste des chambres d'un hôtel
 *     description: Réservé aux hôteliers.
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de l'hôtel
 *     responses:
 *       200: { description: Les chambres de l'hôtel demandé }
 *       400: { description: L'id doit être un nombre entier }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 *       404: { description: Hotel introuvable }
 */
app.get(
  "/hotels/:id/chambres",
  authRequis,
  exigeRole("hotelier"),
  async (req, res) => {
    const { id } = Number(req.params);
    const hotelId = Number(id);

    if (!Number.isInteger(hotelId)) {
      return res
        .status(400)
        .json({ erreur: "L'id doit être un nombre entier" });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ erreur: "Hotel introuvable" });
    }

    const chambres = await prisma.chambre.findMany({
      where: { hotelId },
    });

    res.json(chambres);
  },
);

/**
 * @openapi
 * /chambres:
 *   get:
 *     summary: Récupérer la liste des chambres
 *     description: >
 *       Réservé aux hôteliers. Tous les filtres sont optionnels.
 *       Si date_debut et date_fin sont fournies, seules les chambres
 *       sans réservation confirmée sur cette période sont renvoyées.
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotel
 *         schema: { type: integer }
 *         description: Identifiant de l'hôtel
 *       - in: query
 *         name: capacite
 *         schema: { type: integer }
 *         description: Capacité minimale
 *       - in: query
 *         name: categorie
 *         schema: { type: string }
 *         description: Catégorie de la chambre
 *       - in: query
 *         name: prixMax
 *         schema: { type: number }
 *         description: Prix maximum par nuit
 *       - in: query
 *         name: date_debut
 *         schema: { type: string, format: date }
 *         description: Début de la période souhaitée
 *       - in: query
 *         name: date_fin
 *         schema: { type: string, format: date }
 *         description: Fin de la période souhaitée
 *     responses:
 *       200: { description: Les chambres correspondant aux filtres }
 *       400: { description: Paramètres de requête invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.get(
  "/chambres",
  authRequis,
  exigeRole("hotelier"),
  validerQuery(schemaRechercheChambre),
  async (req, res) => {
    const { hotel, capacite, categorie, prixMax, date_debut, date_fin } =
      req.validatedQuery;
    const where = {};
    if (hotel) where.hotelId = Number(hotel);
    if (capacite) where.capacite = { gte: Number(capacite) };
    if (categorie) where.categorie = categorie;
    if (prixMax) where.prixNuit = { lte: Number(prixMax) };
    if (date_debut && date_fin) {
      where.reservations = {
        none: {
          statut: "confirmee",
          dateDepart: { gt: new Date(date_debut) },
          dateArrivee: { lt: new Date(date_fin) },
        },
      };
    }
    const chambres = await prisma.chambre.findMany({
      where,
      orderBy: { id: "asc" },
    });
    res.json(chambres);
  },
);

/**
 * @openapi
 * /voyageurs/me:
 *   get:
 *     summary: Récupérer les détails de l'utilisateur connecté
 *     description: Réservé aux voyageurs.
 *     tags: [Voyageurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Le profil du voyageur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 email: { type: string, format: email }
 *                 nom: { type: string }
 *                 telephone: { type: string }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.get(
  "/voyageurs/me",
  authRequis,
  exigeRole("voyageur"),
  async (req, res) => {
    const moi = await prisma.compte.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, nom: true, telephone: true },
    });
    res.json(moi);
  },
);

/**
 * @openapi
 * /reservations/mine:
 *   get:
 *     summary: Récupérer les réservations d'un voyageur
 *     description: Réservé aux voyageurs. Triées par date d'arrivée croissante.
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Les réservations du voyageur connecté }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.get(
  "/reservations/mine",
  authRequis,
  exigeRole("voyageur"),
  async (req, res) => {
    const reservations = await prisma.reservation.findMany({
      where: { voyageurId: req.user.userId },
      orderBy: { dateArrivee: "asc" },
    });
    res.json(reservations);
  },
);

/**
 * @openapi
 * /reservations/received:
 *   get:
 *     summary: Récupérer les réservations reçues par un hôtelier
 *     description: Réservé aux hôteliers. Triées par date d'arrivée croissante.
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Les réservations reçues par l'hôtel }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.get(
  "/reservations/received",
  authRequis,
  exigeRole("hotelier"),
  async (req, res) => {
    const reservations = await prisma.reservation.findMany({
      where: { chambre: { hotelId: req.user.hotelId } },
      orderBy: { dateArrivee: "asc" },
    });
    res.json(reservations);
  },
);

//////////////////////////////// POST /////////////////////////////////////

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: S'inscrire en tant que voyageur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasseClair, nom]
 *             properties:
 *               email: { type: string, format: email }
 *               motDePasseClair: { type: string, format: password }
 *               nom: { type: string }
 *               prenom: { type: string }
 *               telephone: { type: string }
 *               note: { type: string }
 *     responses:
 *       201: { description: Compte créé }
 *       400: { description: Données invalides }
 */
app.post("/auth/register", valider(schemaInscription), async (req, res) => {
  const { email, motDePasseClair, nom, prenom, telephone, note } = req.body;
  const compte = await prisma.compte.create({
    data: {
      email,
      motDePasseClair: await bcrypt.hash(motDePasseClair, 10),
      nom,
      prenom,
      telephone,
      note,
      role: "voyageur",
    },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      telephone: true,
      note: true,
    },
  });

  res.status(201).json({ compte });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Se connecter au système
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasseClair]
 *             properties:
 *               email: { type: string, format: email }
 *               motDePasseClair: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string, description: Jeton JWT valable 24h }
 *       400: { description: Données invalides }
 *       401: { description: Identifiants invalides }
 */
app.post("/auth/login", valider(schemaConnexion), async (req, res) => {
  const { email, motDePasseClair } = req.body;
  const compte = await prisma.compte.findUnique({ where: { email } });
  if (
    !compte ||
    !(await bcrypt.compare(motDePasseClair, compte.motDePasseClair))
  ) {
    return res.status(401).json({ erreur: "identifiants invalides" });
  }
  const token = jwt.sign(
    { userId: compte.id, role: compte.role, hotelId: compte.hotelId },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
  res.json({ token });
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Se déconnecter du système
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204: { description: Déconnexion réussie }
 *       401: { description: Jeton absent ou invalide }
 */
app.post("/auth/logout", authRequis, (req, res) => res.status(204).end());

/**
 * @openapi
 * /chambres:
 *   post:
 *     summary: Créer une nouvelle chambre
 *     description: Réservé aux hôteliers.
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hotelId, numero, categorie, capacite, prixNuit]
 *             properties:
 *               hotelId: { type: integer }
 *               numero: { type: string }
 *               categorie: { type: string }
 *               capacite: { type: integer }
 *               prixNuit: { type: number }
 *               description: { type: string }
 *     responses:
 *       201: { description: Chambre créée }
 *       400: { description: Données invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.post(
  "/chambres",
  authRequis,
  exigeRole("hotelier"),
  valider(schemaCreationChambre),
  async (req, res) => {
    const { hotelId, numero, categorie, capacite, prixNuit, description } =
      req.body;
    const chambres = await prisma.chambre.create({
      data: { ...req.body },
    });
    res.status(201).json({ chambres });
  },
);

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     description: Réservé aux voyageurs. La réservation est créée au statut en_attente.
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chambreId, dateArrivee, dateDepart, nbPersonnes]
 *             properties:
 *               chambreId: { type: integer }
 *               dateArrivee: { type: string, format: date }
 *               dateDepart: { type: string, format: date }
 *               nbPersonnes: { type: integer }
 *               demandeSpeciale: { type: string }
 *     responses:
 *       201: { description: Réservation créée }
 *       400: { description: Données invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 */
app.post(
  "/reservations",
  authRequis,
  exigeRole("voyageur"),
  valider(schemaCreationReservation),
  async (req, res) => {
    const { chambreId, dateArrivee, dateDepart, nbPersonnes, demandeSpeciale } =
      req.body;
    const reservation = await prisma.reservation.create({
      data: {
        voyageurId: req.user.userId,
        chambreId,
        dateArrivee,
        dateDepart,
        nbPersonnes,
        demandeSpeciale: demandeSpeciale || null,
        statut: "en_attente",
      },
    });
    res.status(201).json({ reservation });
  },
);

//////////////////////////////// PATCH /////////////////////////////////////

/**
 * @openapi
 * /chambres/{id}:
 *   patch:
 *     summary: Modifier une chambre
 *     description: Réservé aux hôteliers, uniquement pour les chambres de leur hôtel.
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de la chambre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero: { type: string }
 *               categorie: { type: string }
 *               capacite: { type: integer }
 *               prixNuit: { type: number }
 *               description: { type: string }
 *     responses:
 *       200: { description: Chambre mise à jour }
 *       400: { description: Données invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Chambre d'un autre hôtel ou accès refusé }
 *       404: { description: Chambre introuvable }
 */
app.patch(
  "/chambres/:id",
  authRequis,
  exigeRole("hotelier"),
  valider(schemaModificationChambre),
  async (req, res) => {
    const chambre = await prisma.chambre.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!chambre)
      return res.status(404).json({ erreur: "Chambre introuvable" });

    if (chambre.hotelId !== req.user.hotelId) {
      return res.status(403).json({
        erreur: "Vous ne pouvez pas modifier les chambre d'un autre hôtel",
      });
    }

    const { id } = req.params;
    const chambres = await prisma.chambre.update({
      where: { id: Number(id) },
      data: { ...req.body },
    });
    res.json({ chambres });
  },
);

/**
 * @openapi
 * /voyageurs/me:
 *   patch:
 *     summary: Modifier les détails de l'utilisateur connecté
 *     description: Réservé aux voyageurs.
 *     tags: [Voyageurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               telephone: { type: string }
 *               note: { type: string }
 *     responses:
 *       200: { description: Compte mis à jour }
 *       400: { description: Données invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Accès refusé }
 *       404: { description: Voyageur introuvable }
 */
app.patch(
  "/voyageurs/me",
  authRequis,
  exigeRole("voyageur"),
  valider(schemaModifCompte),
  async (req, res) => {
    const voyageur = await prisma.compte.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!voyageur)
      return res.status(404).json({ erreur: "Voyageur introuvable" });

    const currentVoyageur = await prisma.compte.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body },
    });
    res.json({ currentVoyageur });
  },
);

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     summary: Modifier le statut d'une réservation
 *     description: >
 *       Réservé aux hôteliers, uniquement pour les réservations de leur hôtel.
 *       Transitions autorisées : en_attente vers confirmee, refusee ou annulee ;
 *       confirmee vers annulee.
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, confirmee, refusee, annulee]
 *     responses:
 *       200: { description: Réservation mise à jour }
 *       400: { description: Données invalides }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Réservation d'un autre hôtel ou accès refusé }
 *       404: { description: Réservation introuvable }
 *       409: { description: Transition de statut interdite }
 */
app.patch(
  "/reservations/:id",
  authRequis,
  exigeRole("hotelier"),
  valider(schemaModificationReservation),
  async (req, res) => {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(req.params.id) },
      include: { chambre: true },
    });

    if (!reservation)
      return res.status(404).json({ erreur: "Réservation introuvable" });

    if (reservation.chambre.hotelId !== req.user.hotelId) {
      return res.status(403).json({
        erreur: "Vous ne pouvez pas accéder aux réservations d'un autre hôtel",
      });
    }

    if (!transitionValide(reservation.statut, req.body.statut)) {
      return res.status(409).json({
        erreur: `passage de ${reservation.statut} a
${req.body.statut} interdit`,
      });
    }

    const currentReservation = await prisma.reservation.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body },
    });
    res.json(currentReservation);
  },
);

//////////////////////////////// DELETE /////////////////////////////////////

/**
 * @openapi
 * /chambres/{id}:
 *   delete:
 *     summary: Supprimer une chambre
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de la chambre
 *     responses:
 *       200: { description: Chambre supprimée }
 *       401: { description: Jeton absent ou invalide }
 *       404: { description: Chambre introuvable }
 */
app.delete("/chambres/:id", authRequis, async (req, res) => {
  const chambre = await prisma.chambre.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!chambre) return res.status(404).json({ erreur: "Chambre introuvable" });

  const { id } = req.params;
  const chambres = await prisma.chambre.delete({
    where: { id: Number(id) },
  });
  res.json({ chambres });
});

/**
 * @openapi
 * /reservations/{id}:
 *   delete:
 *     summary: Annuler une réservation
 *     description: >
 *       Réservé aux voyageurs, uniquement pour leurs propres réservations.
 *       La réservation n'est pas supprimée : son statut passe à annulee.
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identifiant de la réservation
 *     responses:
 *       200: { description: Réservation annulée }
 *       401: { description: Jeton absent ou invalide }
 *       403: { description: Réservation d'un autre voyageur ou accès refusé }
 *       404: { description: Réservation introuvable }
 *       409: { description: Transition de statut interdite }
 */
app.delete(
  "/reservations/:id",
  authRequis,
  exigeRole("voyageur"),
  async (req, res) => {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!reservation)
      return res.status(404).json({ erreur: "Réservation introuvable" });

    if (reservation.voyageurId !== req.user.userId) {
      return res.status(403).json({
        erreur:
          "Vous ne pouvez pas accéder aux réservations de quelqu'un d'autre",
      });
    }

    if (!transitionValide(reservation.statut, "annulee")) {
      return res.status(409).json({
        erreur: `passage de ${reservation.statut} a annulee interdit`,
      });
    }

    const currentReservation = await prisma.reservation.update({
      where: { id: Number(req.params.id) },
      data: { statut: "annulee" },
    });
    res.json(currentReservation);
  },
);

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API finder", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/**/*.js", "./src/server.js", "./server.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

app.listen(process.env.PORT ?? 3000);
