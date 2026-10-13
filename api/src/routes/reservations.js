import { Router } from 'express';
import prisma from '../prisma.js';
import { authRequis, exigeRole, valider } from '../middlewares.js';
import {schemaCreationReservation, schemaModificationReservation} from '../schemas.js';

const router = Router();

//////////////////////////////// GET /////////////////////////////////////

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
router.get(
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
router.get(
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
router.post(
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
router.patch(
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
router.delete(
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

export default router;