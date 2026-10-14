import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/prisma.js";

beforeAll(() => {
  process.env.JWT_SECRET = "secret_de_test";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Post /login", () => {
  const mockCompte = async () => {
    vi.spyOn(prisma.compte, "findUnique").mockResolvedValue({
      id: 4,
      email: "a.morel@mail.example",
      motDePasseClair: await bcrypt.hash("Voyage-2026!", 4),
      role: "voyageur",
      hotelId: null,
    });
  };

  it("connexion d'un utilisateur, renvoie 200", async () => {
    await mockCompte();

    const reponse = await request(app).post("/auth/login").send({
      email: "a.morel@mail.example",
      motDePasseClair: "Voyage-2026!",
    });

    expect(reponse.status).toBe(200);
    expect(reponse.body.token).toBeDefined();
  });

  it("renvoie un jeton JWT valide", async () => {
    await mockCompte();

    const reponse = await request(app).post("/auth/login").send({
      email: "a.morel@mail.example",
      motDePasseClair: "Voyage-2026!",
    });

    const contenu = jwt.verify(reponse.body.token, process.env.JWT_SECRET);
    expect(contenu.userId).toBe(4);
    expect(contenu.role).toBe("voyageur");
  });

  it("renvoie 401 si le mot de passe est incorrect", async () => {
    await mockCompte();

    const reponse = await request(app).post("/auth/login").send({
      email: "a.morel@mail.example",
      motDePasseClair: "mauvais-mot-de-passe",
    });

    expect(reponse.status).toBe(401);
  });

  it("renvoie 400 si le corps est vide", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("Post /register", () => {
  it("enregistrement d'un utilisateur, renvoie 201", async () => {
    vi.spyOn(prisma.compte, "create").mockResolvedValue({
      id: 4,
      email: "a.morel@mail.example",
      nom: "Morel",
      prenom: "Alice",
      telephone: null,
      note: null,
    });

    const reponse = await request(app).post("/auth/register").send({
      email: "a.morel@mail.example",
      motDePasseClair: "Voyage-2026!",
      nom: "Morel",
      prenom: "Alice",
    });

    expect(reponse.status).toBe(201);
  });

  it("renvoie 400 si le corps est vide", async () => {
    const res = await request(app).post("/auth/register").send({});
    expect(res.status).toBe(400);
  });
});
