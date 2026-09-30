import { z } from "zod";

export const schemaInscription = z.object({
  email: z.string().email({ message: "Email invalide" }),
  motDePasseClair: z
    .string()
    .min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
  nom: z.string(),
  prenom: z.string(),
  telephone: z.string().optional(),
  note: z.string().optional(),
});

export const schemaModifCompte = schemaInscription.partial();

export const schemaConnexion = z.object({
  email: z.string().email({ message: "Identifiants invalides" }),
  motDePasseClair: z.string().min(6, { message: "Identifiants invalides" }),
});

export const schemaCreationChambre = z.object({
  numero: z.string(),
  categorie: z.string(),
  capacite: z.number().int().positive(),
  prixNuit: z.number().positive(),
  description: z.string().optional(),
  hotelId: z.number().int().positive(),
});

export const schemaModificationChambre = schemaCreationChambre.partial();

export const schemaRechercheChambre = z.object({
  hotel: z.coerce.number().int().positive().optional(),
  categorie: z.enum(["double", "familiale", "simple", "suite"]).optional(),
  capacite: z.coerce.number().int().positive().optional(),
  prixMax: z.coerce.number().positive().optional(),
  date_debut: z.coerce.date().optional(),
  date_fin: z.coerce.date().optional(),
});

export const schemaCreationReservation = z.object({
  chambreId: z.number().int().positive(),
  nbPersonnes: z.number().int().positive(),
  statut: z.enum(["en_attente", "confirmee", "refusee", "annulee"]).optional(),
  dateArrivee: z.coerce.date(),
  dateDepart: z.coerce.date(),
});
