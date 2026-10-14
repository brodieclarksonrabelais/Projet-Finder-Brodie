import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

beforeAll(() => {
    process.env.JWT_SECRET = 'secret_de_test';
    let tokenVoyageur = jwt.sign({ id: 4, role: 'voyageur' }, process.env.JWT_SECRET);
    let tokenHotelier = jwt.sign({ id: 1, role: 'hotelier', hotelId: 1 }, process.env.JWT_SECRET);
});

describe("GET /reservations", () => {
    it('revnvoie 200 avec les reservations du voyageur', async() =>{
        const res = await request(app)
            .get('/reservations/mine') 
            .set('Authorization', `Bearer ${tokenVoyageur}`)

        expect(res.status).toBe(200);
    })
    
    it('revnvoie 200 avec les reservations du voyageur' , async() => {
        const res = await request(app)
            .get('/reservations/received')
            .set('Authorization', `Bearer ${tokenHotelier}`)
        expect(res.status).toBe(200);
    })

    it("renvoyer 401 quand le role n'est pas valide", async () => {
      const res = await request(app).get('/reservations/mine');
      expect(res.status).toBe(401);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});