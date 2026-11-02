// prisma/seed.js
import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DATA_DIR = path.join(import.meta.dirname, "..", "finder-data");
const lire = (fichier) =>
  JSON.parse(readFileSync(path.join(DATA_DIR, fichier), "utf8"));

async function main() {
  const chambre = lire("chambres.json");
  const hotel = lire("hotels.json");
  const compte = lire("comptes.json");
  const reservation = lire("reservations.json");

  // Suppression : enfants d'abord (contraintes de clé étrangère)
  await prisma.reservation.deleteMany();
  await prisma.chambre.deleteMany();
  await prisma.compte.deleteMany();
  await prisma.hotel.deleteMany();

  // Création : parents d'abord
  await prisma.hotel.createMany({
    data: hotel.map((h) => ({
      id: h.id,
      nom: h.nom,
      etoiles: h.etoiles,
      adresse: h.adresse,
      codePostal: h.code_postal,
      ville: h.ville,
      telephone: h.telephone,
      email: h.email,
      gerant: h.gerant,
      description: h.description,
    })),
  });

  await prisma.chambre.createMany({
    data: chambre.map((c) => ({
      id: c.id,
      hotelId: c.hotel_id,
      numero: c.numero,
      categorie: c.categorie,
      capacite: c.capacite,
      prixNuit: c.prix_nuit,
      description: c.description,
      disponible: c.disponible,
      etage: c.etage,
    })),
  });

  const compteHache = await Promise.all(
    compte.map(async (c) => ({
      id: c.id,
      role: c.role,
      email: c.email,
      telephone: c.telephone,
      motDePasseClair: await bcrypt.hash(c.mot_de_passe_clair, 10),
      nom: c.nom,
      prenom: c.prenom,
      hotelId: c.hotel_id,
      note: c.note,
    })),
  );
  await prisma.compte.createMany({ data: compteHache });

  await prisma.reservation.createMany({
    data: reservation.map((r) => ({
      id: r.id,
      voyageurId: r.voyageur_id,
      chambreId: r.chambre_id,
      dateArrivee: new Date(r.date_arrivee),
      dateDepart: new Date(r.date_depart),
      nbPersonnes: r.nb_personnes,
      statut: r.statut,
      demandeSpeciale: r.demande_speciale,
    })),
  });

  console.log(`${chambre.length} chambre, ${hotel.length} hotel, 
    ${compte.length} compte, ${reservation.length} reservation`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
