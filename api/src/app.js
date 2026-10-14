import "dotenv/config";
import express from "express";
import chambresRoutes from "./routes/chambres.js";
import hotelsRoutes from "./routes/hotels.js";
import reservationsRoutes from "./routes/reservations.js";
import authRoutes from "./routes/authentification.js";
import voyageursRoutes from "./routes/voyageurs.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

app.use(chambresRoutes);
app.use(hotelsRoutes);
app.use(reservationsRoutes);
app.use(authRoutes);
app.use(voyageursRoutes);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Le serveur est lancé
 *     tags: [Santé]
 *     responses:
 *       200:
 *         description: Le serveur fonctionne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 */
app.get("/health", (req, res) => res.json({ ok: true }));

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "API finder", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/**/*.js", "./src/server.js", "./server.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

export default app;
