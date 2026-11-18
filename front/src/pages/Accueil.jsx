import { Link } from "react-router-dom";
export default function Accueil() {
  return (
    <>
      <div>
        <h2>Accueil</h2>
      </div>
      <div>
        <Link to="/recherche">Rechercher une chambre</Link>
        <br />
        <Link to="/connexion">Se connecter</Link>
        <br />
        <Link to="/inscription">S'inscrire</Link>
        <br />
        <Link to="/reserver/:id">Réserver une chambre</Link>
        <br />
        <Link to="/mes-reservations">Mes réservations</Link>
        <br />
      </div>
    </>
  );
}
