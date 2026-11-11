# Startup Roast Arena — Progress

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked (needs input)

Last updated: Phase 8 (Deployment preparation)

---

## Phase 1 — Backend Foundation
- ✅ Fill `backend/.gitignore` (ignore `node_modules`, `.env`)
- ✅ Create `backend/.env.example`
- ✅ Create `backend/config/db.js` (Mongoose connection)
- ✅ Create `backend/middleware/errorMiddleware.js` (404 + error handler)
- ✅ Create `backend/index.js` (Express server + health check)
- ✅ Owner created `backend/.env` with real `MONGO_URI` + `JWT_SECRET`
- ✅ Confirmed server boots and DB connects (`/api/health` → `database: connected`)

## Phase 2 — Authentication
- ✅ Create `backend/models/User.js`
- ✅ Create `backend/utils/validation.js` (Zod schemas)
- ✅ Create `backend/utils/generateToken.js`
- ✅ Create `backend/controllers/authController.js`
- ✅ Create `backend/middleware/authMiddleware.js`
- ✅ Create `backend/routes/authRoutes.js`
- ✅ Mount `/api/auth` in `index.js`
- ✅ Tested register / login / me against the live DB

## Phase 3 — Startup Ideas
- ✅ `models/Idea.js` (embedded `versions[]` history)
- ✅ `controllers/ideaController.js`
- ✅ `routes/ideaRoutes.js`
- ✅ Tested create / list / single

## Phase 4 — AI Investors
- ✅ Installed `@google/generative-ai` (v0.24.1)
- ✅ `config/aiConfig.js` (default model `gemini-3.5-flash`)
- ✅ `services/aiService.js`
- ✅ `controllers/reviewController.js` + routes
- ✅ Zod AI-response validation + retry/fallback
- ✅ Tested all three investor responses (real Gemini call)

## Phase 5 — Community
- ✅ `models/Vote.js` (unique index idea+user)
- ✅ `controllers/voteController.js` + routes
- ✅ `controllers/leaderboardController.js` + routes
- ✅ Tested duplicate vote (409) and self-vote (403)

## Phase 6 — Re-Pitch
- ✅ Repitch endpoint (owner only)
- ✅ Reviews per version
- ✅ Version comparison data
- ✅ Tested old vs new scores (v1 preserved, v2 created)

## Phase 7 — Frontend
- ✅ Axios `services/api.js` + `context/AuthContext.jsx`
- ✅ Routing in `App.jsx` + providers in `main.jsx`
- ✅ Landing, Register, Login, Dashboard, Submit, Idea Details, Leaderboard, My Ideas, NotFound
- ✅ Voting UI, re-pitch UI, loading/empty/error states
- ✅ Connected to real backend (response shapes verified against live API)
- ✅ `npm run build` passes · `npm run lint` passes
- ✅ `frontend/.env.example` added · `.env` added to `frontend/.gitignore`

## Phase 8 — Final Testing & Deployment
- ✅ Backend end-to-end smoke test against live DB + real Gemini
- ✅ Root `.gitignore` created; backend/frontend `.gitignore` expanded
- ✅ `backend/.env.example` sanitized (placeholder only) + `CLIENT_URL` added
- ✅ Optional env-based CORS added to `backend/index.js`
- ✅ Deployment guide written in `PROJECT_GUIDE.md` (§16)
- ✅ Backend made Vercel-compatible: `export default app`, guarded `app.listen()`, DB-ensure middleware, cached/reusable Mongo connection
- ⬜ Browser manual walkthrough (owner)
- ⬜ Responsive check (owner)
- ⬜ GitHub push (owner, manual)
- ⬜ Deploy backend (Vercel) (owner, manual)
- ⬜ Deploy frontend (Vercel) (owner, manual)
- ⬜ Verify live app (owner)

---

## Needs from owner
- ⬜ Approve deployment (nothing will be deployed without it)
- ⬜ GitHub repository (create + push)
- ⬜ Vercel account/URL for the backend
- ⬜ Vercel account/URL for the frontend
