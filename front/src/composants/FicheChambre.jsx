export default function FicheChambre({ chambre }) {
  return (
    <article>
      <h2>Chambre {chambre.numero}</h2>
      <p>Catégorie: {chambre.categorie}</p>
      <p>Capacité: {chambre.capacite}</p>
      <p>Prix par nuit: {chambre.prixNuit} €</p>
      <p>Description: {chambre.description}</p>
      <p>Étage: {chambre.etage}</p>
    </article>
  );
}
