import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import openapi from "./docs/openapi.js";
import authRoutes from "./routes/auth.js";
import txRoutes from "./routes/transactions.js";
import dashRoutes from "./routes/dashboard.js";
import { errorHandler } from "./middlewares/errors.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/dashboard", dashRoutes);
app.use(errorHandler);

export default app;
