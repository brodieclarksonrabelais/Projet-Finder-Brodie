// server.js (à la racine, à côté de package.json)
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import express from "express";

const hotels = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "..", "finder-data", "hotels.json"),
    "utf8",
  ),
);

const chambres = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, "..", "finder-data", "chambres.json"),
    "utf8",
  ),
);

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/hotels", (req, res) => res.json(hotels));
//app.get("/chambres", (req, res) => res.json(chambres));

app.get("/hotels/:id", (req, res) => {
  const id = Number(req.params.id);
  const hotel = hotels.find((h) => h.id === id);
  if (!hotel) return res.status(404).json({ erreur: "Hotel introuvable" });
  res.json(hotel);
});

app.get("/chambres/:id", (req, res) => {
  const id = Number(req.params.id);
  const chambre = chambres.find((c) => c.id === id);
  if (!chambre) return res.status(404).json({ erreur: "Chambre introuvable" });
  res.json(chambre);
});

app.get("/chambres", (req, res) => {
  const prixMax = Number(req.query.prix_max);
  const chambrePasChere = chambres.filter((cpc) => cpc.prix_nuit <= prixMax);
  if (!chambrePasChere) {
    return res.status(404).json({ erreur: "Chambres introuvable" });
  }
  if (isNaN(prixMax)) {
    return res.status(400).json({ error: "Le prix doit être un nombre" });
  }
  res.json(chambrePasChere);
});

app.listen(process.env.PORT ?? 3000);
