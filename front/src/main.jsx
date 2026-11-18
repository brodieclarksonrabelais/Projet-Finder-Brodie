import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Recherche from "./pages/Recherche";
const router = createBrowserRouter([
  { path: "/", element: <Accueil /> },
  { path: "/recherche", element: <Recherche /> },
  { path: "*", element: <p>404 Introuvable</p> },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
