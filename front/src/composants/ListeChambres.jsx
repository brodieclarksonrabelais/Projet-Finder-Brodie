export default function ListeChambres({ chambres }) {
  if (chambres.length === 0) {
    return <p>Aucune chambres à afficher.</p>;
  }
  return (
    <ul className="liste-chambres">
      {chambres.map((chambre) => (
        <li key={chambre.id}>
          <strong>Chambre {chambre.numero}</strong> ({chambre.categorie}) -{" "}
          {chambre.capacite} personnes - {chambre.prixNuit} €
        </li>
      ))}
    </ul>
  );
}
