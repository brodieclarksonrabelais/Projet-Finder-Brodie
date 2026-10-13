import { Router } from 'express';
import prisma from '../prisma.js';
import { authRequis, exigeRole, valider, validerQuery } from '../middlewares.js';
import {
  schemaRechercheChambre,
  schemaCreationChambre,
  schemaModificationChambre,
} from '../schemas.js';

const router = Router();

//////////////////////////////// GET /////////////////////////////////////

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
router.get("/chambre/:id", authRequis, exigeRole("hotelier"), async (req, res) => {
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
router.get("/chambres", validerQuery(schemaRechercheChambre), async (req, res) => {
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
});

//////////////////////////////// POST /////////////////////////////////////

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
router.post(
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
router.patch(
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
router.delete("/chambres/:id", authRequis, async (req, res) => {
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

export default router;