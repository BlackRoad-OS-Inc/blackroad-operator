# CLAUDE.md - BlackRoad OS Codebase Guide

## Project Overview

BlackRoad OS is an AI-powered operating system platform serving a static frontend via GitHub Pages at **blackroad.io** with a FastAPI backend. The project combines a web dashboard for managing 30,000 AI agents, a blockchain explorer (RoadChain), crypto wallet integrations, payment processing (Stripe), and the "Lucidia" AI consciousness framework.

**Repository:** `blackboxprogramming/blackroad.io`
**License:** MIT
**Domain:** blackroad.io (served via GitHub Pages + CNAME)
**Note:** Active development has moved to the [BlackRoad-OS](https://github.com/BlackRoad-OS) organization. This repo (`blackboxprogramming/blackroad.io`) is legacy but still hosts the live site.

## Architecture

### Frontend (Static HTML/JS - GitHub Pages)

The frontend is a collection of standalone HTML pages with inline CSS and vanilla JavaScript. There is no build step, bundler, or framework — files are served directly by GitHub Pages.

- **API Client:** `blackroad-api.js` — singleton `BlackRoadAPI` class exposed as `window.blackroad`. Handles auth tokens (JWT in localStorage), all API calls, and UI helpers.
- **Navigation:** `blackroad-nav.js` — shared nav component injected via `blackroadNav.inject()` into any page with a `<div id="blackroad-nav">`.
- **Shared CSS:** `style.css` — legacy shared styles (light theme, cards). Most newer pages use inline `<style>` blocks with the dark theme.
- **Legacy login:** `script.js` — simple redirect-based login handler for `login.html`.

### Backend (FastAPI - Python)

Located in `backend/`. A single-file FastAPI application (`main.py`) with in-memory data stores. Deployed to Railway.

**Key characteristics:**
- In-memory storage (dicts) — no database. Data resets on restart.
- JWT auth using PyJWT (`HS256`, 24h expiration)
- Mock AI chat (returns canned responses — no real LLM integration yet)
- Mock Stripe checkout sessions
- CORS set to allow all origins

### Lucidia Subsystem

The `lucidia/` directory contains the "Lucidia" AI consciousness framework — a symbolic/poetic Python module system. These are standalone Python scripts, not wired into the main backend. Key files:
- `core.py` — Emotional primitives (Emotion class with states like love, grief, curiosity)
- `consciousness.py`, `dream.py`, `eternity.py` — Symbolic state management
- `lightline.py`, `symbols.py` — Truth/memory symbolic systems
- `heart.py` — Memory persistence used by `codex/shell.py`
- Various `.txt` files — Narrative/poetic content

### Agent Modules

- `agents/roadie.py` — Search agent that queries memory files
- `agents/guardian.py` — Integrity verification agent (SHA-256 hash checks)
- `agents/consent.py`, `agents/truth.py` — Additional symbolic agents

### Other Components

- `api/server.py` — Alternate legacy FastAPI server exposing Roadie/Guardian via REST + WebSocket
- `codex/shell.py` — Interactive terminal shell for symbolic memory input
- `roadchain/ledger.sol` — Solidity smart contract for RoadChain truth ledger
- `sisters/olympia.py` — Sister agent module
- `memory/` — State files (YAML/text logs for consciousness state)
- `nginx/lucidia.conf` — Nginx reverse proxy config for local development

## File Structure

```
blackroad.io/
├── .github/workflows/       # CI/CD workflows
│   ├── core-ci.yml          # Basic CI guardrail (placeholder lint/test)
│   ├── deploy.yml           # Cloudflare deploy via shared workflow
│   ├── auto-label.yml       # Auto-labels PRs (core/labs)
│   ├── failure-issue.yml    # Creates issues on CI failure
│   ├── project-sync.yml     # Adds PRs to GitHub project board
│   └── python-package-conda.yml  # Conda-based Python CI (flake8 + pytest)
├── backend/
│   ├── main.py              # FastAPI backend (all endpoints)
│   ├── requirements.txt     # Python deps: fastapi, uvicorn, pyjwt, pydantic
│   ├── Procfile             # Railway start command
│   └── railway.json         # Railway deployment config
├── agents/                  # Python agent modules
├── api/                     # Legacy Lucidia API server
├── codex/                   # Codex Infinity shell
├── lucidia/                 # Lucidia consciousness framework
├── memory/                  # State/log files
├── nginx/                   # Nginx config
├── roadchain/               # Solidity smart contract
├── sisters/                 # Sister agent modules
├── blackroad-api.js         # Unified frontend API client
├── blackroad-nav.js         # Shared navigation component
├── index.html               # Main app (auth + pricing)
├── chat.html                # AI chat interface
├── dashboard.html           # Master control panel
├── agents-live.html         # Live agent dashboard
├── agents-dynamic.html      # Dynamic agent spawning UI
├── blockchain-live.html     # RoadChain blockchain explorer
├── blockchain-dynamic.html  # Dynamic blockchain with mining
├── terminal.html            # Web terminal
├── wallet.html              # Crypto wallet management
├── ledger.html              # Ledger hardware wallet (WebUSB)
├── integrations.html        # External service integrations
├── integrations-live.html   # Live integrations with real APIs
├── files-live.html          # File manager
├── social-live.html         # Social feed
├── style.css                # Legacy shared CSS
├── script.js                # Legacy login handler
├── docker-compose.yml       # Docker: lucidia-api + nginx
├── lucidia-agent.py         # File watcher that auto-pushes to GitHub
├── test-api.sh              # API test script (curl-based)
├── CNAME                    # GitHub Pages custom domain (blackroad.io)
├── .nojekyll                # Prevents Jekyll processing on GitHub Pages
└── DEPLOYMENT.md            # Detailed deployment guide
```

## Development Setup

### Frontend (no build required)

```bash
# Serve locally with Python
python3 -m http.server 8000

# Or open HTML files directly in browser
open index.html
```

The frontend auto-detects environment in `blackroad-api.js`:
- `localhost` / `127.0.0.1` -> `http://localhost:8000`
- Production -> `https://core.blackroad.systems`

### Backend

```bash
cd backend
pip install -r requirements.txt
python3 main.py
# Runs on http://localhost:8000
```

### Docker (full stack)

```bash
docker-compose up
# lucidia-api on port 8000, nginx on port 80
```

### Testing

```bash
# API smoke tests (requires backend running on localhost:8000)
chmod +x test-api.sh
./test-api.sh
```

There is a conda-based CI workflow (`python-package-conda.yml`) that runs flake8 and pytest, but no formal test suite exists yet.

## API Endpoints

All endpoints are defined in `backend/main.py`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/ready` | No | Readiness check |
| POST | `/api/auth/register` | No | Register user (email, password, name) |
| POST | `/api/auth/login` | No | Login (email, password) -> JWT |
| GET | `/api/auth/me` | Yes | Get current user info |
| POST | `/api/ai-chat/chat` | Optional | Send chat message |
| GET | `/api/ai-chat/conversations` | Optional | List conversations |
| POST | `/api/agents/spawn` | Optional | Spawn an agent |
| GET | `/api/agents/list` | Optional | List agents |
| GET | `/api/agents/{id}` | No | Get agent by ID |
| DELETE | `/api/agents/{id}` | Yes | Terminate agent |
| GET | `/api/blockchain/blocks` | No | Get blocks |
| POST | `/api/blockchain/transaction` | Optional | Create transaction |
| GET | `/api/blockchain/transactions` | No | Get transactions |
| POST | `/api/payments/create-checkout-session` | No | Create Stripe checkout |
| POST | `/api/payments/verify-payment` | Optional | Verify payment |
| GET | `/api/files/list` | Optional | List files |
| GET | `/api/social/feed` | No | Get social feed |
| GET | `/api/system/stats` | No | Get system stats |

## Environment Variables

### Backend (`backend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `blackroad-secret-key-change-in-production` | JWT signing key |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe secret key |
| `PORT` | `8000` | Server port (Railway sets this) |

### Frontend

No environment variables. API base URL is hardcoded in `blackroad-api.js` with localhost/production detection.

## Deployment

### Frontend
Deployed automatically via GitHub Pages on push to `main`. The `CNAME` file maps to `blackroad.io`. The `.nojekyll` file ensures raw JS files are served correctly.

There is also a Cloudflare deploy workflow (`.github/workflows/deploy.yml`) that references a shared workflow from `blackboxprogramming/blackroad-deploy`.

### Backend
Deployed to Railway using `backend/Procfile` and `backend/railway.json`. The start command is:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Conventions and Patterns

### Naming
- HTML pages use kebab-case: `agents-live.html`, `blockchain-dynamic.html`
- The `-live` suffix indicates pages with real API integration
- The `-dynamic` suffix indicates pages with interactive/simulated features
- Python files use snake_case
- JS uses camelCase for variables/methods, PascalCase for classes

### Frontend Patterns
- Each HTML page is self-contained with inline `<style>` and `<script>` blocks
- Pages include `blackroad-api.js` via `<script src="/blackroad-api.js"></script>`
- Pages include `blackroad-nav.js` for shared navigation
- Auth tokens stored in `localStorage` under key `blackroad_auth_token`
- The dark theme uses: background `#02030a`, text `#ffffff`, accent `#7700FF`
- Brand gradient: `linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF)`

### Backend Patterns
- Single-file FastAPI app with all routes in `backend/main.py`
- Pydantic models for request validation
- In-memory dicts for all data storage (no database)
- JWT tokens via PyJWT with Bearer scheme
- SHA-256 for password hashing (no salting — not production-ready)

### Git Workflow
- Main branch: `main` (remote), `master` (local alias in some contexts)
- Frontend deploys automatically on push to `main`
- The `lucidia-agent.py` watcher can auto-commit and push changes
- CI runs on push/PR to `main`/`master`

## Important Notes for AI Assistants

1. **No build step:** This is a static site. Do not add webpack, vite, or any bundler unless explicitly asked. HTML files are served as-is.
2. **No package.json:** There is no Node.js dependency management. Frontend is pure vanilla JS.
3. **Backend is in-memory:** All data is lost on restart. Do not assume persistence.
4. **Security is minimal:** Passwords are unsalted SHA-256, CORS is `*`, JWT secret has a weak default. Flag security concerns but don't refactor without being asked.
5. **Legacy status:** This repo is marked as legacy/archived per `ARCHIVED.md`. Active development is at the [BlackRoad-OS](https://github.com/BlackRoad-OS) organization.
6. **Self-contained pages:** Each HTML page has its own inline styles. There is no shared component system beyond `blackroad-nav.js` and `blackroad-api.js`.
7. **Lucidia modules are standalone:** The `lucidia/`, `agents/`, `codex/`, and `sisters/` directories contain independent Python scripts not integrated into the main backend.
8. **The Stripe publishable key** in `index.html` is a test key. Do not replace it with a live key in code.
9. **Docker setup** uses the legacy `api/server.py`, not the newer `backend/main.py`.
