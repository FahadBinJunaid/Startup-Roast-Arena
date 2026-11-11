// index.js
// Responsibility: the entry point of the backend.
// It loads environment variables, sets up Express, connects to MongoDB,
// mounts the routes, and exports the app.
//
// LOCAL DEVELOPMENT: it also starts a normal long-running server.
// VERCEL: this same file is used as a serverless function, so we EXPORT the
// Express app as the default export and skip app.listen() when on Vercel.

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
//    On Vercel there is no .env file; the variables come from the dashboard,
//    so dotenv simply finds nothing and the app keeps working.
dotenv.config();

// 2) Create the Express application (ONE app, shared by local + Vercel).
const app = express();

// 3) Global middleware.
// CORS: if CLIENT_URL is set (for example on Vercel), only that frontend
// origin is allowed. If it is not set, all origins are allowed so local
// development keeps working without any extra configuration.
const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL.split(",").map((origin) => origin.trim()) }
  : {};

app.use(cors(corsOptions));
app.use(express.json()); // parse incoming JSON request bodies

// 4) Make sure MongoDB is connected BEFORE any route runs.
//    On Vercel the app is a serverless function that can cold-start at any
//    moment, so we connect here. connectDB() is safe to call many times:
//    it reuses the existing connection instead of opening a new one.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// 5) Simple checks.
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

// 6) Mount feature routes.
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 7) 404 handler + central error handler. These MUST come after the routes.
app.use(notFound);
app.use(errorHandler);

// 8) LOCAL DEVELOPMENT: start a normal long-running server.
//    On Vercel, process.env.VERCEL is set, so we skip this block entirely.
//    Vercel calls the exported app for us, so we must NOT call app.listen().
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  async function startServer() {
    try {
      await connectDB();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    }
  }

  startServer();
}

// 9) Export the Express app so Vercel can run it as a serverless function.
//    Vercel looks for an `index.js` at the project root that exports the app.
export default app;
