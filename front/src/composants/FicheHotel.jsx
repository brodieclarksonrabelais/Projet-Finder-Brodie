export default function FicheHotel({ hotel }) {
  return (
    <article>
      <h2>{hotel.nom}</h2>
      <p>
        adresse: {hotel.adresse}, {hotel.codePostal}, {hotel.ville}
      </p>
      <p>étoiles: {hotel.etoiles}</p>
      <p>téléphone: {hotel.telephone}</p>
      <p>email: {hotel.email}</p>
      <p>gérant: {hotel.gerant}</p>
      <p>description: {hotel.description}</p>
    </article>
  );
}
