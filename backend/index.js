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

// 3) Global middleware. CORS MUST run before every route so that all API
//    responses (including errors) carry the Access-Control-Allow-Origin header.
//
// How the allowed origins are decided:
//   - CLIENT_URL (from the environment) can list one or more frontend origins,
//     separated by commas, e.g.
//       CLIENT_URL=https://my-frontend.vercel.app,https://my-frontend-git-main.vercel.app
//   - Each entry is trimmed and any trailing slash is removed, so a small typo
//     like "https://my-frontend.vercel.app/" still works.
//   - Local development origins (Vite on port 5173, backend on port 5000) are
//     ALWAYS allowed, so `npm run dev` keeps working even when CLIENT_URL is
//     set to a production URL.
//   - If CLIENT_URL is empty, every origin is allowed (handy for local dev and
//     for a first deployment). We never combine a wildcard with credentials.

// Turn "a, b ,c/" into ["a", "b", "c"] (lowercased, no trailing slashes).
function parseOrigins(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, "").toLowerCase())
    .filter((origin) => origin.length > 0);
}

const clientOrigins = parseOrigins(process.env.CLIENT_URL);

// Origins that must always work for local development.
const localOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];

const allowedOrigins = clientOrigins.concat(localOrigins);

// When CLIENT_URL is not set we allow any origin. As soon as it is set we only
// allow the origins it lists (plus local development).
const allowAllOrigins = clientOrigins.length === 0;

// Normalize an incoming Origin header the same way we normalized CLIENT_URL.
function normalizeOrigin(origin) {
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

const corsOptions = {
  // A function gives us full control: allow the request or reject it cleanly.
  origin: function (origin, callback) {
    // Requests with no Origin header (curl, health checks, server-to-server)
    // are always allowed.
    if (!origin) {
      return callback(null, true);
    }

    if (allowAllOrigins || allowedOrigins.includes(normalizeOrigin(origin))) {
      // Returning true makes the cors package echo back the exact origin,
      // never a wildcard.
      return callback(null, true);
    }

    // Not allowed: return false so no CORS header is added. The browser then
    // blocks the response (this is the correct, safe way to reject).
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // We use JWT in the Authorization header (not cookies), so we do not need
  // credentials. Keeping this false avoids any wildcard+credentials problem.
  credentials: false,
};

// app.use() runs for every path and method. The cors middleware also answers
// OPTIONS preflight requests automatically (with 204) before any route or the
// database middleware is reached.
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
