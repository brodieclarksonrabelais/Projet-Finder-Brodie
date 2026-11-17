export default function ListeChambres({ chambres, onChoix }) {
  if (chambres.length === 0) {
    return <p>Aucune chambre</p>;
  }
  return (
    <ul>
      {chambres.map((c) => (
        <li key={c.id} onClick={() => onChoix(c)}>
          {c.numero} - {c.categorie}, {c.capacite} personnes, {c.prixNuit} €
        </li>
      ))}
    </ul>
  );
}