import "dotenv/config";
import app from "./app.js";

app.listen(process.env.PORT, () => {
  console.log(`Serveur démarré sur le port ${process.env.PORT ?? 3000}`);
});
