import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /chambres", () => {
  it("rend la liste des chambres", async () => {
    const res = await request(app).get("/chambres");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(33);
  });
});
