import { Link } from "react-router-dom";
export default function Accueil() {
  return (
    <p>
      Accueil - <Link to="/recherche">Rechercher une chambre</Link>
    </p>
  );
}
