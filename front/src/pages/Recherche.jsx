import { useEffect, useState } from "react";
import { API } from "../config";
import ListeChambres from "../composants/ListeChambres";
import FicheChambre from "../composants/FicheChambre";
import FicheHotel from "../composants/FicheHotel";

const CRITERES_VIDES = {
  hotel: "",
  date_debut: "",
  date_fin: "",
  capacite: "",
  prix_max: "",
  categorie: "",
};

// Un champ vide ne part pas : sinon l'API filtrerait sur une chaîne vide.
// encodeURIComponent protège espaces et accents dans l'URL.
function construireQuery(criteres) {
  return Object.entries(criteres)
    .filter(([, valeur]) => valeur !== "")
    .map(([cle, valeur]) => `${cle}=${encodeURIComponent(valeur)}`)
    .join("&");
}

export default function Recherche() {
  // Ce que l'utilisateur TAPE : un objet à six clés (formulaire contrôlé)
  const [criteres, setCriteres] = useState(CRITERES_VIDES);
  // Ce qu'il a VALIDÉ : c'est de lui que dépendent les effets
  const [valides, setValides] = useState(CRITERES_VIDES);
  // Compteur de soumissions : relance l'appel même si les critères sont identiques
  const [version, setVersion] = useState(0);

  // Les données, le chargement, l'erreur
  const [chambres, setChambres] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La chambre dont on affiche la fiche
  const [selection, setSelection] = useState(null);

  // Appel des chambres : au montage (critères vides = tout), puis à chaque soumission
  useEffect(() => {
    let annule = false;
    const q = construireQuery(valides);

    fetch(`${API}/chambres${q ? "?" + q : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!annule) setChambres(data);
      })
      .catch(() => {
        if (!annule) setErreur("Service indisponible, réessayez plus tard.");
      })
      .finally(() => {
        if (!annule) setEnChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [valides, version]);

  // Fiche de l'hôtel : seulement si le critère hotel est renseigné
  useEffect(() => {
    if (valides.hotel === "") return; // vide : rien n'est appelé
    let annule = false;

    fetch(`${API}/hotels/${encodeURIComponent(valides.hotel)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`); // un 404 devient une erreur
        return r.json();
      })
      .then((data) => {
        if (!annule) setHotel(data);
      })
      .catch(() => {
        if (!annule) setErreur("Hôtel introuvable ou service indisponible.");
      });

    return () => {
      annule = true;
    };
  }, [valides.hotel, version]);

  function modifier(e) {
    const { name, value } = e.target;
    setCriteres((c) => ({ ...c, [name]: value }));
  }

  function rechercher(e) {
    e.preventDefault();
    // Ce qui découle du clic se pose dans le gestionnaire, pas dans l'effet
    setEnChargement(true);
    setErreur(null);
    setSelection(null);
    setHotel(null);
    setValides(criteres);
    setVersion((v) => v + 1);
  }

  return (
    <>
      <form onSubmit={rechercher}>
        <input
          type="number"
          name="hotel"
          value={criteres.hotel}
          onChange={modifier}
          placeholder="Hôtel (id)"
          min="1"
        />
        <input
          type="date"
          name="date_debut"
          value={criteres.date_debut}
          onChange={modifier}
        />
        <input
          type="date"
          name="date_fin"
          value={criteres.date_fin}
          onChange={modifier}
        />
        <input
          type="number"
          name="capacite"
          value={criteres.capacite}
          onChange={modifier}
          placeholder="Capacité"
          min="1"
        />
        <input
          type="number"
          name="prix_max"
          value={criteres.prix_max}
          onChange={modifier}
          placeholder="Prix max (€)"
          min="0"
        />
        <select name="categorie" value={criteres.categorie} onChange={modifier}>
          <option value="">Toutes catégories</option>
          <option value="simple">Simple</option>
          <option value="double">Double</option>
          <option value="familiale">Familiale</option>
          <option value="suite">Suite</option>
        </select>
        <button type="submit">Rechercher</button>
      </form>

      {/* Pas de sortie anticipée : le formulaire reste affiché pendant le chargement et après une erreur */}
      {enChargement && <p>Chargement...</p>}
      {erreur && <p role="alert">{erreur}</p>}

      {hotel && <FicheHotel hotel={hotel} />}

      {!enChargement && !erreur && (
        <>
          <p>Nombre de chambres : {chambres.length}</p>
          <ListeChambres chambres={chambres} onChoix={setSelection} />
        </>
      )}

      {selection && (
        <>
          <FicheChambre
            chambre={selection}
            onFermer={() => setSelection(null)}
          />
          <button onClick={() => setSelection(null)}>Fermer la fiche</button>
        </>
      )}
    </>
  );
}
