import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Recherche from "./pages/Recherche";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MesReservations from "./pages/MesReservations";
import Reservations from "./pages/Reservations";

const router = createBrowserRouter([
  { path: "/", element: <Accueil /> },
  { path: "/recherche", element: <Recherche /> },
  { path: "/connexion", element: <Connexion /> },
  { path: "/inscription", element: <Inscription /> },
  { path: "/mes-reservations", element: <MesReservations /> },
  { path: "/reserver/:id", element: <Reservations /> },
  { path: "*", element: <p>404 Page introuvable</p> },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
