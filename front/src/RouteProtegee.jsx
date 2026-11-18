import { Navigate } from "react-router-dom";
import { jeton } from "./auth";

export default function RouteProtegee({ children }) {
  if (!jeton()) return <Navigate to="/connexion" replace />;
  return children;
}
