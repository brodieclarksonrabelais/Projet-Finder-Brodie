import { Router } from 'express';
import prisma from '../prisma.js';
import { authRequis, exigeRole, valider } from '../middlewares.js';
import {schemaModifCompte } from '../schemas.js';

const router = Router();

//////////////////////////////// GET /////////////////////////////////////

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
router.get(
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

//////////////////////////////// PATCH /////////////////////////////////////

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
router.patch(
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

export default router;