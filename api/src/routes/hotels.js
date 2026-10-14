import { Router } from "express";
import prisma from "../prisma.js";
import { authRequis, exigeRole } from "../middlewares.js";

const router = Router();

//////////////////////////////// GET /////////////////////////////////////

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
router.get("/hotels", async (req, res) => {
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
router.get("/hotel/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) return res.status(404).json({ erreur: "Hotel introuvable" });
  res.json(hotel);
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
router.get(
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

export default router;
