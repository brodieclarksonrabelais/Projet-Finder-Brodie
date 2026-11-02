/// ESPACE POUR LES IMPORTS
import { Router } from "express";
import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRequis, valider } from "../middlewares.js";
import { schemaInscription, schemaConnexion } from "../schemas.js";

const router = Router();

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
router.post("/auth/register", valider(schemaInscription), async (req, res) => {
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
router.post("/auth/login", valider(schemaConnexion), async (req, res) => {
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
    { expiresIn: "1h" },
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
router.post("/auth/logout", authRequis, (req, res) => res.status(204).end());

export default router;
