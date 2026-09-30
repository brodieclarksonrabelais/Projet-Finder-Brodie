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
} from "./schemas.js";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

//////////////////////////////// Middlewares /////////////////////////////////////

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

function exigeRole(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ erreur: "acces refuse" });
}

// Pour les routes avec un corps (POST, PATCH)
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

// Pour les paramètres d'URL (GET)
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

//////////////////////////////// GET /////////////////////////////////////

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/hotels", authRequis, exigeRole("hotelier"), async (req, res) => {
  res.json(await prisma.hotel.findMany());
});
//app.get("/chambres", (req, res) => res.json(chambres));

app.get("/hotel/:id", authRequis, exigeRole("hotelier"), async (req, res) => {
  const { id } = Number(req.params);
  const hotel = await prisma.hotel.findUnique({ where: { id: Number(id) } });
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  if (!hotel) return res.status(404).json({ erreur: "Hotel introuvable" });
  res.json(hotel);
});

app.get("/chambre/:id", authRequis, exigeRole("hotelier"), async (req, res) => {
  const { id } = Number(req.params);
  const chambre = await prisma.chambre.findUnique({
    where: { id: Number(id) },
  });
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erreur: "L'id doit être un nombre entier" });
  }
  if (!chambre) return res.status(404).json({ erreur: "Chambre introuvable" });
  res.json(chambre);
});

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

//////////////////////////////// POST /////////////////////////////////////

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
    { userId: compte.id, role: compte.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
  res.json({ token });
});

app.post("/auth/logout", authRequis, (req, res) => res.status(204).end());

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

//////////////////////////////// DELETE /////////////////////////////////////

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

app.listen(process.env.PORT ?? 3000);
