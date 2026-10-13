import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /chambres", () => {
  it("recherche des chambres et renvoie 200", async () => {
    const res = await request(app).get("/chambres");
    expect(res.status).toBe(200);
  });

  
});

describe('POST /chambres', () => {
    it('POST /chambres renvoie 201 si la chambre est créée', async () => {
        process.env.JWT_SECRET = 'secret_de_test';
        const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 2 }, process.env.JWT_SECRET);

        const newChambre = {
        hotelId: 4,                        
        numero: "456",                             
        categorie: "double",                       
        capacite: 2,                                
        prixNuit: 91,                               
        description: "placeholder", 
        disponible: true                               
        };

        const creerSpy = vi.spyOn(prisma.chambres, 'create').mockResolvedValue({
        id: 74,
        ...newChambre
        });

        const res = await request(app)
        .post('/chambres')
        .set('Authorization', `Bearer ${fauxToken}`)
        .send(newChambre);

        expect(res.status).toBe(201);
        expect(creerSpy).toHaveBeenCalled();
    });
});
