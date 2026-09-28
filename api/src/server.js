// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

//////////////////////////////// GET /////////////////////////////////////

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


app.get("/hotels/:id/chambres", async (req, res) => {
  const { id } = req.params;
  const hotelId = Number(id);

  if (!Number.isInteger(hotelId)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) {
    return res.status(404).json({ erreur: "Hotel introuvable" });
  }

  const chambres = await prisma.chambre.findMany({
    where: { hotelId },
  });

  res.json(chambres);
});


app.get("/chambres", async (req, res) => {
  const { hotel, capacite, categorie, prixMax, date_debut, date_fin } = req.query;
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

app.post('/auth/register', async (req, res) => {
const { email, mot_de_passe_clair, nom, prenom, telephone, note} = req.body;
const compte = await prisma.compte.create({
  data:{email, mot_de_passe_clair: await bcrypt.hash(mot_de_passe_clair, 10), nom, prenom, telephone, note, role: 'voyageur'},
  select: {id: true, email: true, nom: true, prenom: true, telephone: true, note: true}
});

res.status(201).json({ compte });
});


app.listen(process.env.PORT ?? 3000);
