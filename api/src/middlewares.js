import jwt from 'jsonwebtoken';

//////////////////////////////// Middlewares /////////////////////////////////////

//vérification du token JWT et récupération des informations de l'utilisateur
export function authRequis(req, res, next) {
  const entete = req.headers.authorization || "";
  const token = entete.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erreur: "jeton absent ou invalide" });
  }
}

// Vérification du rôle de l'utilisateur
export function exigeRole(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ erreur: "acces refuse" });
}

// Validation des données d'entrée avec Zod
export function valider(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body ?? {});
    if (!resultat.success) {
      return res.status(400).json({ erreurs: resultat.error.issues });
    }
    req.body = resultat.data;
    next();
  };
}

// Validation des paramètres de requête avec Zod
export function validerQuery(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.query);
    if (!resultat.success) {
      return res.status(400).json({ erreurs: resultat.error.issues });
    }
    req.validatedQuery = resultat.data;
    next();
  };
}

const TRANSITIONS_AUTORISEES = {
  en_attente: ["confirmee", "refusee", "annulee"],
  confirmee: ["annulee"],
  refusee: [],
  annulee: [],
};

// Vérifie si la transition de statut est valide
function transitionValide(statutActuel, statutVoulu) {
  return (TRANSITIONS_AUTORISEES[statutActuel] || []).includes(statutVoulu);
}