import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import prisma from "../src/prisma.js";

let tokenVoyageur;
let tokenHotelier;

beforeAll(() => {
  process.env.JWT_SECRET = "secret_de_test";
  tokenVoyageur = jwt.sign(
    { userId: 4, role: "voyageur" },
    process.env.JWT_SECRET,
  );
  tokenHotelier = jwt.sign(
    { userId: 1, role: "hotelier", hotelId: 1 },
    process.env.JWT_SECRET,
  );
});

beforeEach(() => {
  vi.spyOn(prisma.reservation, "findMany").mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /reservations", () => {
  it("renvoie 200 avec les reservations du voyageur", async () => {
    const res = await request(app)
      .get("/reservations/mine")
      .set("Authorization", `Bearer ${tokenVoyageur}`);

    expect(res.status).toBe(200);
  });

  it("renvoie 200 avec les reservations reçues par l'hôtelier", async () => {
    const res = await request(app)
      .get("/reservations/received")
      .set("Authorization", `Bearer ${tokenHotelier}`);

    expect(res.status).toBe(200);
  });

  it("renvoie 401 quand il n'y a pas de token", async () => {
    const res = await request(app).get("/reservations/mine");
    expect(res.status).toBe(401);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
