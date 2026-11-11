// index.js
// Responsibility: the entry point of the backend.
// It loads environment variables, sets up Express, connects to MongoDB,
// mounts the routes, and starts the server.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// 1) Load variables from .env into process.env. Must run before we use them.
dotenv.config();

// 2) Create the Express application.
const app = express();

// 3) Global middleware.
// CORS: if CLIENT_URL is set (for example on Render), only that frontend
// origin is allowed. If it is not set, all origins are allowed so local
// development keeps working without any extra configuration.
const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL.split(",").map((origin) => origin.trim()) }
  : {};

app.use(cors(corsOptions));
app.use(express.json()); // parse incoming JSON request bodies

// 4) Simple checks.
app.get("/", (req, res) => {
  res.json({ message: "Startup Roast Arena API is running" });
});

app.get("/api/health", (req, res) => {
  // mongoose.connection.readyState: 0 disconnected, 1 connected,
  // 2 connecting, 3 disconnecting.
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const databaseState = states[mongoose.connection.readyState] || "unknown";

  res.json({ status: "ok", database: databaseState });
});

// 5) Mount feature routes.
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 6) 404 handler + central error handler. These MUST come after the routes.
app.use(notFound);
app.use(errorHandler);

// 7) Start the server only after the database connects.
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
