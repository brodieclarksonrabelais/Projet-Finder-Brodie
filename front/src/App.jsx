import FicheHotel from "./composants/FicheHotel";
import FicheChambre from "./composants/FicheChambre";
import ListeChambres from "./composants/ListeChambres";

const hotel = {
  id: 3,
  nom: "Caraïbes",
  etoiles: 2,
  adresse: "Route de la plage",
  codePostal: "34250",
  ville: "Palavas-les-Flots",
  telephone: "04 67 00 55 66",
  email: "contact@caraibes.example",
  gerant: "M. Toussaint",
  description:
    "Hôtel familial face à la mer, 10 chambres, parking gratuit, animaux acceptés.",
};

const chambre = {
  id: 1,
  hotelId: 1,
  numero: "101",
  categorie: "simple",
  capacite: 1,
  prixNuit: 69,
  description: "Lit simple, douche, bureau.",
  disponible: true,
  etage: 1,
};

const chambre2 = {
  id: 2,
  hotelId: 1,
  numero: "102",
  categorie: "double",
  capacite: 2,
  prixNuit: 95,
  description: "Lit simple, douche, bureau.",
  disponible: true,
};
const chambre3 = {
  id: 3,
  hotelId: 1,
  numero: "103",
  categorie: "familiale",
  capacite: 4,
  prixNuit: 149,
  description: "Lit simple, douche, bureau.",
  disponible: true,
};

// function App() {
//   return (
//     <div className="App">
//       <h1>Finder</h1>
//     </div>
//   );
// }

export default function App() {
  return (
    <>
      <FicheHotel hotel={hotel} />
      <FicheChambre chambre={chambre} />
      <ListeChambres chambres={[chambre, chambre2, chambre3]} />
    </>
  );
}
