import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";


describe("Post /login", () => {
    it("connexion d'un utilisateur, renvoie 200", async () => {

        vi.spyOn(prisma.comptes, 'findUnique').mockResolvedValue({
            id: 4,
            email: "a.morel@mail.example",
            motDePasseClaire: await bcrypt.hash("Voyage-2026!", 4), // hash du mot de passe envoyé
            role: 'voyageur',
            hotelId: null
        });

        const reponse = await request(app).post('/auth/login').send({
            email: "a.morel@mail.example",
            motDePasseClaire: "Voyage-2026!"
        });

        expect(reponse.status).toBe(200);
        expect(reponse.body.token).toBeDefined();
    });

    it("renvoie 200 et un jeton JWT valide", async () => {
        const contenu = jwt.verify(reponse.body.token, process.env.JWT_SECRET);
        expect(contenu.id).toBe(5);
        expect(contenu.role).toBe('voyageur');
    });

    
    it("renvoie 400 si le corps est vide", async () => {
        const res = await request(app).post("/auth/login").send({});
        expect(res.status).toBe(400);
    });
});