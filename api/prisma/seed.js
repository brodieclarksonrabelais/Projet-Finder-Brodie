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
    data: hotel.map((e) => ({
      id: e.id,
      nom: e.nom,
      etoiles: e.etoiles,
      adresse: e.adresse,
      codePostal: e.code_postal,
      ville: e.ville,
      telephone: e.telephone,
      email: e.email,
      gerant: e.gerant,
      description: e.description,
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
    })),
  });

  const compteHache = await Promise.all(
    compte.map(async (a) => ({
      id: a.id,
      role: a.role,
      email: a.email,
      telephone: a.telephone,
      motDePasseClair: await bcrypt.hash(a.mot_de_passe_clair, 10),
      nom: a.nom,
      prenom: a.prenom,
      hotelId: a.hotel_id,
      note: a.note,
    })),
  );
  await prisma.compte.createMany({ data: compteHache });

  await prisma.reservation.createMany({
    data: reservation.map((e) => ({
      id: e.id,
      voyageurId: e.voyageur_id,
      chambreId: e.chambre_id,
      dateArrivee: new Date(e.date_arrivee),
      dateDepart: new Date(e.date_depart),
      nbPersonnes: e.nb_personnes,
      statut: e.statut,
      demandeSpeciale: e.demande_speciale,
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
