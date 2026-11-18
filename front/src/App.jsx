import { useState } from "react";
import FicheHotel from "./composants/FicheHotel";
import FicheChambre from "./composants/FicheChambre";
import ListeChambres from "./composants/ListeChambres";
import Recherche from "./pages/Recherche";

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

const chambres = [
  {
    id: 1,
    hotelId: 3,
    numero: "101",
    categorie: "simple",
    capacite: 1,
    prixNuit: 69,
    description: "Lit simple, douche, bureau.",
    disponible: true,
    etage: 1,
  },
  {
    id: 2,
    hotelId: 3,
    numero: "102",
    categorie: "double",
    capacite: 2,
    prixNuit: 95,
    description: "Lit double, douche, télévision.",
    disponible: true,
    etage: 1,
  },
  {
    id: 3,
    hotelId: 3,
    numero: "103",
    categorie: "familiale",
    capacite: 4,
    prixNuit: 149,
    description: "Un lit double et deux lits simples, salle de bain.",
    disponible: true,
    etage: 1,
  },
  {
    id: 4,
    hotelId: 3,
    numero: "104",
    categorie: "double",
    capacite: 2,
    prixNuit: 95,
    description: "Lit double, douche, vue sur la mer.",
    disponible: true,
    etage: 1,
  },
  {
    id: 5,
    hotelId: 3,
    numero: "212",
    categorie: "suite",
    capacite: 4,
    prixNuit: 189,
    description: "Salon séparé, lit double, baignoire, balcon.",
    disponible: true,
    etage: 2,
  },
];

export default function App() {
  const [chambre, setChambres] = useState(chambres);
  const [selection, setSelection] = useState(null);

  function ajouterMutation() {
    chambres.push({ id: 99, numero: 999, categorie: "Test", prixNuit: 999 });
    console.log("Nombre d'éléments du tableau :", chambres.length);
  }

  function ajouterProprement() {
    setChambres([
      ...chambres,
      { id: 99, numero: 999, categorie: "Test", prixNuit: 999 },
    ]);
  }

  return (
    <>
      <h1>Finder</h1>
      <Recherche />
      <p>Nombre de chambres : {chambres.length}</p>
      {/* <ListeChambres chambres={chambres} onChoix={setSelection} />
      {selection && (
        <FicheChambre chambre={selection} onFermer={() => setSelection(null)} />
      )}
      {selection && (
        <button onClick={() => setSelection(null)}>Fermer la fiche</button>
      )} */}
      {/* <FicheHotel hotel={hotel} />
      <button onClick={ajouterMutation}>Ajouter une chambre (mutation)</button>
      <button onClick={ajouterProprement}>Ajouter une chambre (proprement)</button> */}
    </>
  );
}
