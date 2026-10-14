import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/prisma.js";

beforeAll(() => {
  process.env.JWT_SECRET = "secret_de_test";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /chambres", () => {
  it("recherche des chambres et renvoie 200", async () => {
    vi.spyOn(prisma.chambre, "findMany").mockResolvedValue([]);

    const res = await request(app).get("/chambres");
    expect(res.status).toBe(200);
  });
});

describe("POST /chambres", () => {
  it("chambres renvoie 201 si la chambre est créée", async () => {
    const fauxToken = jwt.sign(
      { userId: 99, role: "hotelier", hotelId: 2 },
      process.env.JWT_SECRET,
    );

    const newChambre = {
      hotelId: 2,
      numero: "456",
      categorie: "double",
      capacite: 2,
      prixNuit: 91,
      description: "placeholder",
    };

    vi.spyOn(prisma.chambre, "create").mockResolvedValue({
      id: 10,
      ...newChambre,
      disponible: true,
    });

    const res = await request(app)
      .post("/chambres")
      .set("Authorization", `Bearer ${fauxToken}`)
      .send(newChambre);

    expect(res.status).toBe(201);
  });
});
