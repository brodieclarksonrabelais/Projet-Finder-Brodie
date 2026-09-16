// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/hotels", async (req, res) => {
  res.json(await prisma.hotel.findMany());
});
//app.get("/chambres", (req, res) => res.json(chambres));

app.get("/hotel/:id", async (req, res) => {
  const { id } = req.params;
  const hotel = await prisma.hotel.findUnique({ where: { id: Number(id) } });
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  if (!hotel) return res.status(404).json({ erreur: "Hotel introuvable" });
  res.json(hotel);
});

app.get("/chambre/:id", async (req, res) => {
  const { id } = req.params;
  const chambre = await prisma.chambre.findUnique({
    where: { id: Number(id) },
  });
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  if (!chambre) return res.status(404).json({ erreur: "Chambre introuvable" });
  res.json(chambre);
});

app.get("/chambres", async (req, res) => {
  const { prixMax } = Number(req.params.id);
  const where = {};
  if (prixMax) where.prix_nuit = { lte: prixMax };
  const chambresPasChere = await prisma.chambre.findMany({
    where,
    orderBy: { prix_nuit: "asc" },
  });
  if (!chambresPasChere) {
    return res.status(404).json({ erreur: "Chambres introuvable" });
  }
  if (isNaN(prixMax)) {
    return res.status(400).json({ error: "Le prix doit être un nombre" });
  }
  res.json(chambresPasChere);
});

app.listen(process.env.PORT ?? 3000);
