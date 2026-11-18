import { useState, useEffect } from "react";
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

// Un champ vide ne part pas dans la query string
function construireQuery(criteres) {
  const params = new URLSearchParams();
  Object.entries(criteres).forEach(([cle, valeur]) => {
    if (valeur !== "") params.append(cle, valeur);
  });
  return params.toString();
}

export default function Recherche() {
  // Ce qui est tapé dans le formulaire (champs contrôlés)
  const [saisie, setSaisie] = useState(CRITERES_VIDES);
  // Le critère validé : il pilote l'effet. Au montage, il est vide : on charge tout.
  const [critere, setCritere] = useState(CRITERES_VIDES);
  // Compteur de soumissions : permet de relancer la même recherche deux fois
  const [soumissions, setSoumissions] = useState(0);

  const [chambres, setChambres] = useState([]);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [selection, setSelection] = useState(null);
  const [hotel, setHotel] = useState(null);

  const hotelId = critere.hotel;

  const modifier = (e) => {
    const { name, value } = e.target;
    setSaisie((precedent) => ({ ...precedent, [name]: value }));
  };

  // Appel au montage, puis à chaque soumission (critere ou soumissions change)
  useEffect(() => {
    let annule = false;
    const query = construireQuery(critere);

    fetch(`${API}/chambres${query ? `?${query}` : ""}`)
      .then((reponse) => {
        if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
        return reponse.json();
      })
      .then((donnees) => {
        if (!annule) setChambres(donnees);
      })
      .catch(() => {
        // API arrêtée (fetch lève) ou statut non-ok (levé plus haut)
        if (!annule) setErreur("Service indisponible, réessayez plus tard.");
      })
      .finally(() => {
        // dans les deux cas, le chargement s'arrête
        if (!annule) setEnChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [critere, soumissions]);

  // Fiche de l'hôtel : seulement si le critère hotel est renseigné
  useEffect(() => {
    if (hotelId === "") return; // vide : rien n'est appelé
    let annule = false;

    fetch(`${API}/hotels/${encodeURIComponent(hotelId)}`)
      .then((reponse) => {
        if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
        return reponse.json();
      })
      .then((donnees) => {
        if (!annule) setHotel(donnees);
      })
      .catch(() => {
        // hôtel inconnu (404) ou API arrêtée
        if (!annule) setErreur("Hôtel introuvable ou service indisponible.");
      });

    return () => {
      annule = true;
    };
  }, [hotelId, soumissions]);

  const rechercher = (e) => {
    e.preventDefault();
    setEnChargement(true);
    setErreur(null);
    setSelection(null);
    setHotel(null); // efface l'ancienne fiche avant la nouvelle recherche
    setCritere({ ...saisie });
    setSoumissions((n) => n + 1); // relance l'effet même si le critère est identique
  };

  return (
    <>
      <form onSubmit={rechercher}>
        <input
          type="number"
          name="hotel"
          value={saisie.hotel}
          onChange={modifier}
          placeholder="Hôtel (id)"
          min="1"
        />
        <input
          type="date"
          name="date_debut"
          value={saisie.date_debut}
          onChange={modifier}
        />
        <input
          type="date"
          name="date_fin"
          value={saisie.date_fin}
          onChange={modifier}
        />
        <input
          type="number"
          name="capacite"
          value={saisie.capacite}
          onChange={modifier}
          placeholder="Capacité"
          min="1"
        />
        <input
          type="number"
          name="prix_max"
          value={saisie.prix_max}
          onChange={modifier}
          placeholder="Prix max (€)"
          min="0"
        />
        <select name="categorie" value={saisie.categorie} onChange={modifier}>
          <option value="">Toutes catégories</option>
          <option value="simple">Simple</option>
          <option value="double">Double</option>
          <option value="familiale">Familiale</option>
          <option value="suite">Suite</option>
        </select>
        <button type="submit">Rechercher</button>
      </form>

      {enChargement && <p>Recherche en cours...</p>}
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
