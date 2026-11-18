import { useState } from "react";

export default function ListeChambres({ chambres }) {
  // Comme dans Programme.jsx : on mémorise l'id choisi, null = rien de choisi
  const [chambreChoisie, setChambreChoisie] = useState(null);

  if (chambres.length === 0) {
    return <p>Aucune chambre à afficher.</p>;
  }

  const detail =
    chambreChoisie === null
      ? null
      : chambres.find((c) => c.id === chambreChoisie);

  return (
    <div className="chambres" style={{ display: "flex", gap: "2rem" }}>
      <ul className="liste-chambres">
        {chambres.map((chambre) => (
          <li
            key={chambre.id}
            onClick={() => setChambreChoisie(chambre.id)}
            style={{ cursor: "pointer" }}
          >
            <strong>Chambre {chambre.numero}</strong>
          </li>
        ))}
      </ul>

      {detail && (
        <aside className="detail-chambre">
          <h3>Chambre {detail.numero}</h3>
          <p>
            {detail.categorie}, {detail.capacite} personne
            {detail.capacite > 1 ? "s" : ""}
          </p>
          <p>{detail.prixNuit} €</p>
        </aside>
      )}
    </div>
  );
}