import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /chambres", () => {
  it("recherche des chambres et renvoie 200", async () => {
    const res = await request(app).get("/chambres");
    expect(res.status).toBe(200);
  });
});
