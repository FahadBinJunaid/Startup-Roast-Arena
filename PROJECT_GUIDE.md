# Startup Roast Arena — Project Guide

> This file is the single source of truth for the project. It documents the
> assignment, the architecture, the database, the API, the frontend, security,
> AI integration, testing and deployment. It also records the owner's coding
> and teaching preferences. **Keep this file updated whenever an important
> implementation decision changes.**

Last updated: Phase 8 (Deployment preparation)

---

## 1. Project Overview

**Startup Roast Arena** is a full-stack web application where users submit
startup ideas and receive feedback from three fictional AI investors:

1. **Strict Investor** — focuses on business reality, revenue, expenses,
   market size and competition. Gives a practical improvement tip.
2. **Funny Investor** — gives humorous feedback based on the selected roast
   level, but still includes one genuinely useful business observation.
3. **Dreamer Investor** — focuses on future potential, expansions and how the
   idea could grow into a larger business. Gives a practical improvement tip.

The community can then browse ideas, read the three reviews, vote, and compete
on a leaderboard. Founders can **re-pitch** an improved version of their idea
and compare scores between versions.

---

## 2. Assignment Requirements

### Idea submission form
Users submit four fields:
- **Problem** — what problem does the startup solve?
- **Solution** — how will it solve the problem?
- **Target Customer** — who will use/buy it?
- **Roast Level** — `Mild`, `Medium`, or `Spicy`

### AI investor output (per investor)
- Investor name
- Score from **1 to 10**
- Short roast / feedback
- Improvement tip
- Fictional funding offer
- Equity percentage

### Community features
- View all submitted ideas
- Open a single idea and read all three investor reviews
- Vote for an idea (one vote per user per idea)
- View voting results
- View the leaderboard

### Re-pitch
- Founder can submit an improved version of their idea
- Previous version is preserved
- New reviews are generated for the new version
- Previous and new scores can be compared

---

## 3. Technology Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Dev server + build tool |
| JavaScript (JSX) | Language |
| CSS | Styling |
| Axios | HTTP requests to the backend |
| React Router 7 | Client-side routing |
| Lucide React | Icons |

### Backend
| Tool | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | Web framework |
| JavaScript **ES Modules** (`import`/`export`) | Module system |
| MongoDB Atlas | Cloud database |
| Mongoose 9 | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth tokens |
| dotenv | Loads secrets from `.env` |
| cors | Allows the frontend origin |
| Zod 4 | Request + AI-response validation |

### AI
- **Google Gemini API** via the official SDK (`@google/generative-ai`), installed
  in Phase 4.
- AI logic lives in **one service file** (`backend/services/aiService.js`) so the
  provider can be swapped later.
- The Gemini API key lives only in the backend `.env`. It is **never** sent to
  the frontend.
- **Default model:** `gemini-3.5-flash` (set in `backend/config/aiConfig.js`).
  It was verified to return valid JSON with this project's API key. Override it
  with the optional `GEMINI_MODEL` variable in `backend/.env` if needed.
  Note: `gemini-2.5-flash` is retired for new API keys, so do not use it.

### Version notes (important for beginners)
The installed versions are newer than most tutorials:
- **Express 5** — async errors are handled slightly differently; we use explicit
  `try/catch` in controllers.
- **Mongoose 9** — `unique: true` still creates an index; duplicate-key errors
  arrive as `error.code === 11000`.
- **Zod 4** — top-level formats like `z.email()` are preferred (the old
  `z.string().email()` still works but is deprecated).

---

## 4. Architecture Overview

Classic **MVC-style** backend with a separate React frontend.

```
Browser (React + Vite)
        │  Axios (JSON + Bearer JWT)
        ▼
Express API (Render)
        │  Mongoose
        ▼
MongoDB Atlas
        │
        └── Express also calls the Gemini API for investor reviews
```

- The frontend never talks to MongoDB or Gemini directly.
- All secrets stay on the backend.
- Every protected request sends `Authorization: Bearer <token>`.

---

## 5. Folder Structure

```
STARTUP-ROAST-ARENA/
│
├── PROJECT_GUIDE.md          ← this file
├── PROGRESS.md               ← task tracking
├── project-structure.txt     ← old tree dump (kept, not used)
│
├── backend/
│   ├── config/
│   │   ├── db.js             ← MongoDB connection
│   │   └── aiConfig.js       ← AI limits (funding, equity, score)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ideaController.js
│   │   ├── reviewController.js
│   │   ├── voteController.js
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  ← verifies JWT, loads req.user
│   │   └── errorMiddleware.js ← 404 + central error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Idea.js
│   │   ├── Review.js
│   │   └── Vote.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── ideaRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── voteRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── services/
│   │   └── aiService.js       ← Gemini calls + retry/fallback
│   ├── utils/
│   │   ├── validation.js      ← Zod schemas
│   │   └── generateToken.js   ← JWT signing helper
│   ├── index.js               ← server entry point
│   ├── .env                   ← secrets (NOT in git)
│   ├── .env.example           ← placeholder template (in git)
│   └── .gitignore
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── IdeaCard.jsx
    │   │   ├── InvestorReviewCard.jsx
    │   │   ├── RoastBadge.jsx
    │   │   ├── Loader.jsx
    │   │   ├── ErrorMessage.jsx
    │   │   └── EmptyState.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   ← login state + JWT storage
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Register.jsx
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── SubmitIdea.jsx
    │   │   ├── IdeaDetails.jsx
    │   │   ├── Leaderboard.jsx
    │   │   ├── MyIdeas.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   └── api.js            ← Axios instance + getErrorMessage
    │   ├── App.jsx            ← all routes + Navbar/Footer layout
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx           ← BrowserRouter + AuthProvider
    ├── .env                   ← VITE_API_URL only (NOT in git)
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## 6. Database Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | required, **hashed with bcryptjs** |
| createdAt / updatedAt | Date | via `{ timestamps: true }` |

### Idea
| Field | Type | Notes |
|---|---|---|
| owner | ObjectId (ref User) | required |
| versions | Array of version sub-documents | full history |
| currentVersion | Number | starts at 1 |
| createdAt / updatedAt | Date | timestamps |

**Idea version sub-document** (embedded):
| Field | Type |
|---|---|
| versionNumber | Number |
| problem | String |
| solution | String |
| targetCustomer | String |
| roastLevel | String enum: `Mild`, `Medium`, `Spicy` |
| createdAt | Date |

The **latest version** = `versions[versions.length - 1]`. We keep the whole array
so old versions are never overwritten (re-pitch requirement).

### Review
| Field | Type | Notes |
|---|---|---|
| idea | ObjectId (ref Idea) | required |
| versionNumber | Number | which version this review belongs to |
| investorName | String | e.g. "Strict Investor" |
| score | Number | 1–10 |
| roast | String | feedback text |
| improvementTip | String | one tip |
| fundingAmount | Number | fictional, capped |
| equityPercentage | Number | fictional, capped |
| createdAt / updatedAt | Date | timestamps |

### Vote
| Field | Type | Notes |
|---|---|---|
| idea | ObjectId (ref Idea) | required |
| user | ObjectId (ref User) | required |
| createdAt / updatedAt | Date | timestamps |

**Unique index:** `{ idea: 1, user: 1 }` — the database itself rejects a second
vote from the same user on the same idea (duplicate-key error `11000`).

---

## 7. API Endpoints

Base URL (local): `http://localhost:5000/api`

### Authentication — `/api/auth`
| Method | URL | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/register` | No | `{ name, email, password }` | Create account, return JWT |
| POST | `/login` | No | `{ email, password }` | Log in, return JWT |
| GET | `/me` | Yes | — | Return the logged-in user |

### Ideas — `/api/ideas`
| Method | URL | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/` | Yes | `{ problem, solution, targetCustomer, roastLevel }` | Create idea (version 1) |
| GET | `/` | No | — | List all ideas (latest version) |
| GET | `/:id` | No | — | One idea + all versions |
| PUT | `/:id/repitch` | Yes (owner) | same as create | Add a new version |

### Reviews — under `/api/ideas/:id`
| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ideas/:id/evaluate` | Yes (owner) | Generate + save 3 AI reviews for current version |
| GET | `/api/ideas/:id/reviews` | No | Get reviews (optionally `?version=N`) |

### Voting — under `/api/ideas/:id`
| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ideas/:id/vote` | Yes | Cast one vote |
| GET | `/api/ideas/:id/votes` | No | Vote count + whether current user voted |

### Leaderboard — `/api/leaderboard`
| Method | URL | Auth | Purpose |
|---|---|---|---|
| GET | `/api/leaderboard` | No | Ranked ideas (AI score + votes) |

### Health
| Method | URL | Purpose |
|---|---|---|
| GET | `/` | API running check |
| GET | `/api/health` | API + DB status check |

**Status codes used:** `200` OK, `201` Created, `400` Bad request/validation,
`401` Not authenticated, `403` Not allowed (e.g. self-vote, not owner),
`404` Not found, `409` Conflict (duplicate email/vote), `500` Server error.

---

## 8. Frontend Pages

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Landing | `/` | Hero, how it works, CTA |
| 2 | Register | `/register` | name, email, password |
| 3 | Login | `/login` | email, password |
| 4 | Dashboard | `/dashboard` | My ideas, quick stats |
| 5 | Submit Idea | `/submit` | the 4-field form + roast level |
| 6 | Idea Details | `/ideas/:id` | all 3 reviews, vote button, version compare |
| 7 | Leaderboard | `/leaderboard` | ranked table |
| 8 | My Ideas | `/my-ideas` | manage + re-pitch |

**Design direction:** modern startup-pitching platform — clean layout,
professional typography, good spacing, responsive cards, clear navigation,
consistent buttons, loading states, empty states, error messages, mobile-friendly.

**Rules:** no fake hardcoded data replacing real features; no placeholder buttons.

---

## 9. Security Rules

- Passwords hashed with **bcryptjs** (never stored in plain text).
- **JWT** authentication; protected routes require a valid token.
- `authMiddleware` verifies the token and loads `req.user`.
- Ownership checked before idea updates / re-pitches (owner only).
- Voting rules enforced on the **backend** (not just the frontend):
  - one vote per user per idea (unique DB index),
  - no voting for your own idea.
- All incoming request bodies validated with **Zod**.
- Secrets only in backend `.env`; `.env` is git-ignored.
- Errors returned as JSON without leaking secrets; stack traces hidden in
  production.

---

## 10. AI Integration & Validation

**Service:** `backend/services/aiService.js` (provider-agnostic wrapper).

Flow for `POST /api/ideas/:id/evaluate`:
1. Load idea + current version.
2. Ask Gemini for **structured JSON** containing exactly three investors.
3. Parse the JSON text.
4. **Validate with Zod** (`aiReviewSchema`).
5. Check:
   - exactly three investors present (Strict, Funny, Dreamer),
   - each score between **1 and 10**,
   - funding amount within `MAX_FUNDING`,
   - equity within `MIN_EQUITY`–`MAX_EQUITY`.
6. If parsing/validation fails → **retry once**.
7. If it still fails → return a clear `502` error and **save nothing**.
8. If valid → save the three `Review` documents.

**Limits config:** `backend/config/aiConfig.js`
```js
export const AI_LIMITS = {
  MIN_SCORE: 1,
  MAX_SCORE: 10,
  MAX_FUNDING: 5000000,   // fictional funding cap (PKR)
  MIN_EQUITY: 1,          // %
  MAX_EQUITY: 30,         // %
  INVESTORS: ["Strict Investor", "Funny Investor", "Dreamer Investor"],
};
```

**Missing API key behaviour:** if `GEMINI_API_KEY` is not set, the evaluate
endpoint returns a clear error explaining how to configure it. The rest of the
app keeps working. We never pretend the AI succeeded.

---

## 11. Leaderboard Formula

Simple, fair 70/30 blend:

```
finalScore = (0.7 × aiScore) + (0.3 × voteScore)

aiScore    = average of the 3 investor scores for the LATEST version   (0–10)
voteScore  = (ideaVotes / maxVotesAcrossAllIdeas) × 10                  (0–10)
```

- `aiScore` is already on a 1–10 scale.
- `voteScore` is **normalized** so the most-voted idea gets 10 and raw vote
  counts cannot produce an unlimited score.
- If no idea has any votes, `voteScore = 0`.
- `finalScore` is rounded to 2 decimals for display.

---

## 12. Voting Rules (backend-enforced)

1. Must be logged in (valid JWT).
2. Cannot vote for your own idea → `403`.
3. One vote per user per idea → enforced by unique index → `409` on duplicate.
4. Votes stored in MongoDB (`Vote` collection).

---

## 13. Re-Pitch / Versioning

- `POST /api/ideas` creates version **1**.
- `PUT /api/ideas/:id/repitch` (owner only) pushes a new version
  (`currentVersion + 1`) into the `versions` array. Old versions are preserved.
- `POST /api/ideas/:id/evaluate` generates reviews for the **current** version.
- `GET /api/ideas/:id/reviews?version=N` returns reviews for a specific version,
  enabling **score comparison** between versions on the frontend.

---

## 14. Environment Variables

### Backend `backend/.env` (never committed)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
CLIENT_URL=
NODE_ENV=development
```

### Frontend `frontend/.env` (public config only)
```env
VITE_API_URL=http://localhost:5000/api
```

`.env.example` files with placeholders are committed. Real credentials are
provided by the project owner and are **never** committed or placed in frontend
code. `.gitignore` ignores `.env` and `.env.*` but keeps `.env.example`.

---

## 15. Testing Plan

Backend tested with **Postman / Thunder Client**. For each endpoint we record:
method, URL, headers, example body, expected response, purpose.

Test list:
1. Register a user
2. Login
3. Access a protected route
4. Submit an idea
5. Get all ideas
6. Get a single idea
7. Generate AI reviews
8. Verify all three investor responses
9. Test invalid AI output handling
10. Vote for an idea
11. Try voting twice (expect 409)
12. Try voting for your own idea (expect 403)
13. Check leaderboard
14. Re-pitch an idea
15. Compare previous and new versions

> We never claim an endpoint works unless it has actually been tested.

---

## 16. Deployment Guide

### Hosts

| Part | Host | Root folder |
|---|---|---|
| Database | MongoDB Atlas | — |
| Backend API | Render | `backend/` |
| Frontend | Vercel | `frontend/` |
| Source code | GitHub | repository root |

Nothing is deployed yet. The steps below are for manual setup.

### 16.1 Backend → Render

- **Repository:** Startup Roast Arena
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`  (this runs `node index.js`)
- **Environment variables to add on Render:**
  | Variable | Value |
  |---|---|
  | `MONGO_URI` | your MongoDB Atlas connection string |
  | `JWT_SECRET` | a long random secret |
  | `GEMINI_API_KEY` | your Google Gemini API key |
  | `GEMINI_MODEL` | `gemini-3.5-flash` (optional, this is the default) |
  | `CLIENT_URL` | your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |
  | `NODE_ENV` | `production` |

  Do **not** set `PORT` on Render — Render provides it automatically and the
  server already uses `process.env.PORT` with a fallback to `5000`.

- The health check is `GET /api/health` (returns `{ "status": "ok", "database": "connected" }`).

### 16.2 Frontend → Vercel

- **Repository:** Startup Roast Arena
- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment variable to add on Vercel:**
  | Variable | Value |
  |---|---|
  | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

  The `/api` suffix is required. The frontend reads this at build time via
  `import.meta.env.VITE_API_URL` (see `frontend/src/services/api.js`).

### 16.3 Connecting the Vercel frontend to the Render backend

1. Deploy the backend first and copy its URL (e.g. `https://sra-api.onrender.com`).
2. In Vercel, set `VITE_API_URL = https://sra-api.onrender.com/api`.
3. Copy the Vercel URL (e.g. `https://sra.vercel.app`).
4. In Render, set `CLIENT_URL = https://sra.vercel.app` so the backend only
   accepts requests from your deployed frontend.
5. Redeploy the frontend after changing `VITE_API_URL` (Vite bakes env vars in
   at build time).

### 16.4 CORS and MongoDB Atlas access

- **CORS:** the backend uses `cors()` with the origin taken from `CLIENT_URL`.
  When `CLIENT_URL` is empty (local development), all origins are allowed.
  Set `CLIENT_URL` to your Vercel URL in production.
- **MongoDB Atlas Network Access:** add `0.0.0.0/0` to the IP Access List (or
  Render's outbound IPs) so the Render server can reach the database. This is
  the simplest option for a class project.
- **MongoDB Atlas Database Access:** make sure a database user exists and its
  credentials are part of `MONGO_URI`.
- Never commit API keys or database passwords; keep them in the host dashboards
  and in local `.env` files only (both are git-ignored).

---

## 17. Coding & Teaching Preferences (VERY IMPORTANT)

- Simple, beginner-friendly JavaScript. Code like a patient teacher.
- `async/await`, meaningful names, plain `if/else`, simple functions.
- Clear `try/catch` error handling.
- Readable formatting; one task per function; comments on important logic.
- No compressed one-liners, no deep ternaries, no clever abstractions.
- Prefer a simple `for` loop over a complicated array-method chain.
- No unnecessary packages; controllers/routes/models/services stay separate.
- Everything in **ES Modules** (`import`/`export`).
- Frontend and backend stay separate.
- For every file created, explain: (1) why it's needed, (2) its responsibility,
  (3) what each important import does, (4) how the main functions work,
  (5) how it connects to other files.
- Work **feature by feature**; test before moving on; diagnose failures.
- Tell the owner which terminal/folder to use and give copy-paste-ready commands.
- Ask the owner for credentials instead of inventing them.
- Keep `PROJECT_GUIDE.md` and `PROGRESS.md` updated.
- Prioritise a working MVP over optional extras (short deadline).

---

## 18. Implementation Phases

1. **Backend Foundation** — `.gitignore`, `.env.example`, DB connection, Express
   server, health check.
2. **Authentication** — User model, register, login, hashing, JWT, middleware.
3. **Startup Ideas** — Idea model, create, list, single.
4. **AI Investors** — aiService, 3 personalities, JSON, Zod, retry, save.
5. **Community** — Vote model, duplicate/self-vote prevention, leaderboard.
6. **Re-Pitch** — versions, new reviews, comparison.
7. **Frontend** — routing, auth, pages, voting, leaderboard, re-pitch UI.
8. **Final Testing & Deployment** — end-to-end, responsive, GitHub, deploy.

---

## 19. Change Log

| Date/Phase | Change |
|---|---|
| Phase 1 | Created PROJECT_GUIDE.md, PROGRESS.md, `.gitignore`, `.env.example`, `config/db.js`, `middleware/errorMiddleware.js`, `index.js`. |
| Phase 2 | Added `User` model, `utils/validation.js`, `utils/generateToken.js`, `controllers/authController.js`, `middleware/authMiddleware.js`, `routes/authRoutes.js`; mounted `/api/auth` + `/api/health`. |
| Phase 3 | Added `models/Idea.js` (embedded `versions[]`), `controllers/ideaController.js` (create/list/single/repitch + owner check), `routes/ideaRoutes.js`; mounted `/api/ideas`. |
| Phase 4 | Installed `@google/generative-ai`; added `config/aiConfig.js`, `services/aiService.js` (3 personalities, JSON, Zod validation, retry once, investor ordering), `models/Review.js`, `controllers/reviewController.js`, `routes/reviewRoutes.js`. |
| Phase 5 | Added `models/Vote.js` (unique index idea+user), `controllers/voteController.js`, `routes/voteRoutes.js`; added `optionalAuth` middleware. |
| Phase 6 | Added `controllers/leaderboardController.js` (70/30 formula) + `routes/leaderboardRoutes.js`; re-pitch versioning verified. |
| Phase 7 | Built full React frontend: design system (`index.css`, `App.css`), `services/api.js`, `context/AuthContext.jsx`, components (Navbar, Footer, IdeaCard, InvestorReviewCard, RoastBadge, Loader, ErrorMessage, EmptyState, ProtectedRoute) and pages (Landing, Register, Login, Dashboard, SubmitIdea, IdeaDetails, Leaderboard, MyIdeas, NotFound); routing in `App.jsx`, providers in `main.jsx`; added `frontend/.env.example` and `.env` to `.gitignore`. `npm run build` and `npm run lint` pass. |
| Phase 8 (prep) | Deployment preparation: added root `.gitignore`, expanded `backend/.gitignore` + `frontend/.gitignore`; sanitized `backend/.env.example` (removed real cluster host, added `CLIENT_URL`); added optional env-based CORS in `backend/index.js`; documented the full Render/Vercel deployment guide. |
