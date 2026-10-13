import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../src/prisma.js", () => ({
  default: {
    compte: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    hotel: {
      findMany: vi.fn(),
    },
    chambre: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    reservation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import app from "../src/app.js";
import prisma from "../src/prisma.js";

process.env.JWT_SECRET = "secret-vitest";

function creerToken(role, userId = 12, hotelId = 3) {
  return jwt.sign({ userId, role, hotelId }, process.env.JWT_SECRET);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Routes API", () => {
  it("refuse une inscription avec un corps vide", async () => {
    const reponse = await request(app).post("/auth/register").send({});

    expect(reponse.status).toBe(400);
    expect(prisma.compte.create).not.toHaveBeenCalled();
  });

  it("refuse une connexion lorsque le compte est inconnu", async () => {
    prisma.compte.findUnique.mockResolvedValue(null);

    const reponse = await request(app).post("/auth/login").send({
      email: "inconnu@example.com",
      motDePasseClair: "motdepasse",
    });

    expect(reponse.status).toBe(401);
    expect(reponse.body.erreur).toBe("identifiants invalides");
  });

  it("renvoie la liste des chambres", async () => {
    const chambres = [{ id: 1, numero: "101", hotelId: 3 }];
    prisma.chambre.findMany.mockResolvedValue(chambres);

    const reponse = await request(app).get("/chambres");

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual(chambres);
  });

  it("rejette un filtre de chambre invalide", async () => {
    const reponse = await request(app).get("/chambres?categorie=presidentielle");

    expect(reponse.status).toBe(400);
    expect(prisma.chambre.findMany).not.toHaveBeenCalled();
  });

  it("renvoie la liste des hôtels", async () => {
    const hotels = [{ id: 1, nom: "Hotel Finder" }];
    prisma.hotel.findMany.mockResolvedValue(hotels);

    const reponse = await request(app).get("/hotels");

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual(hotels);
  });

  it("protège la liste des chambres d'un hôtel", async () => {
    const reponse = await request(app).get("/hotels/3/chambres");

    expect(reponse.status).toBe(401);
    expect(prisma.hotel.findMany).not.toHaveBeenCalled();
  });

  it("protège les réservations du voyageur connecté", async () => {
    const reponse = await request(app).get("/reservations/mine");

    expect(reponse.status).toBe(401);
    expect(prisma.reservation.findMany).not.toHaveBeenCalled();
  });

  it("interdit à un voyageur de consulter les réservations reçues", async () => {
    const token = creerToken("voyageur");
    const reponse = await request(app)
      .get("/reservations/received")
      .set("Authorization", `Bearer ${token}`);

    expect(reponse.status).toBe(403);
    expect(prisma.reservation.findMany).not.toHaveBeenCalled();
  });

  it("protège le profil du voyageur", async () => {
    const reponse = await request(app).get("/voyageurs/me");

    expect(reponse.status).toBe(401);
    expect(prisma.compte.findUnique).not.toHaveBeenCalled();
  });

  it("interdit à un hôtelier de modifier le profil voyageur", async () => {
    const token = creerToken("hotelier");
    const reponse = await request(app)
      .patch("/voyageurs/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ nom: "Nouveau nom" });

    expect(reponse.status).toBe(403);
    expect(prisma.compte.update).not.toHaveBeenCalled();
  });
});