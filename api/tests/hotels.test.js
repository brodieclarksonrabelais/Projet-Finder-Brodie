import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /hotels", () => {
  it("recherche des hotels et renvoie 200", async () => {
    const res = await request(app).get("/chambres");
    expect(res.status).toBe(200);
  });

    it("recherche des hotels avec un id et renvoie 200", async () => {
        const hotel = 1;
        const chambresFiltrees = await request(app).get(`/chambres?hotel=${hotel}`);
      expect(chambresFiltrees.status).toBe(200);
    });

});