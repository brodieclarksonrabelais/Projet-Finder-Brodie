import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /hotels", () => {
  it("recherche des hotels et renvoie 200", async () => {
    vi.spyOn(prisma.hotel, "findMany").mockResolvedValue([]);

    const res = await request(app).get("/hotels");
    expect(res.status).toBe(200);
  });

  it("recherche des hotels avec un id et renvoie 200", async () => {
    const hotelId = 1;
    vi.spyOn(prisma.hotel, "findUnique").mockResolvedValue({
      id: hotelId,
      nom: "Hôtel de test",
    });

    const res = await request(app).get(`/hotel/${hotelId}`);
    console.log(res.text);
    expect(res.status).toBe(200);
  });
});
