# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

---

## Features

- **Assignment Listing** — Browse assignments by difficulty (Beginner / Intermediate / Advanced)
- **SQL Studio** — Monaco Editor with syntax highlighting, auto-complete, Ctrl+Enter to run
- **Real-time Execution** — Queries run against PostgreSQL sandbox, results in formatted table
- **Schema & Sample Data Viewer** — See table schemas and preview data before writing queries
- **LLM Hints** — Contextual hints (not solutions) powered by Google Gemini
- **My Attempts** — Save and reload previous SQL queries per assignment (login required)
- **Auth System** — Register/login to save query attempt history
- **Mobile Responsive** — Works on 320px to desktop, mobile-first SCSS

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React.js | Component-based UI, perfect for multi-panel studio layout |
| Styling | Vanilla SCSS | Variables, mixins, nesting, BEM naming, mobile-first breakpoints |
| Code Editor | Monaco Editor | VSCode editor in-browser with SQL syntax highlighting |
| Backend | Node.js + Express.js | Minimal, fast, great middleware ecosystem |
| Sandbox DB | PostgreSQL | ACID-compliant, excellent SQL standard support for learning |
| Persistence DB | MongoDB Atlas | Flexible schema for assignments and user attempt history |
| LLM | Google Gemini (gemini-2.0-flash) | Fast, free tier available, great for hint generation |
| Auth | JWT | Stateless auth, no session storage needed |

---

## Project Structure

```
ciphersqlstudio/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                    Express app entry point
│       ├── config/
│       │   ├── mongodb.js              Mongoose connection
│       │   └── postgres.js             pg Pool + sandbox tables + seed data
│       ├── models/
│       │   ├── User.js                 Auth + attempts history schema
│       │   └── Assignment.js           Assignment metadata + table schemas
│       ├── controllers/
│       │   ├── authController.js       register / login / getMe
│       │   ├── assignmentController.js list, get by ID, seed 6 assignments
│       │   ├── queryController.js      execute SQL, save attempts to MongoDB
│       │   └── hintController.js       Google Gemini (@google/genai) hints
│       ├── routes/
│       │   ├── auth.js
│       │   ├── assignments.js
│       │   ├── query.js
│       │   └── hints.js
│       ├── middleware/
│       │   └── auth.js                 protect + optionalAuth JWT middleware
│       └── utils/
│           └── sqlValidator.js         SELECT-only, strips comments, blocks keywords
└── frontend/
    ├── package.json
    ├── .env.example
    ├── public/index.html
    └── src/
        ├── index.js
        ├── App.jsx                     Routes setup
        ├── services/api.js             All axios calls centralized
        ├── hooks/useAuth.jsx           Auth context
        ├── components/
        │   ├── Navbar.jsx
        │   ├── AssignmentCard.jsx
        │   └── ResultsTable.jsx
        ├── pages/
        │   ├── AssignmentsPage.jsx     Grid with difficulty filters
        │   ├── StudioPage.jsx          Editor + results + hints + attempts
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        └── styles/
            ├── main.scss               Global styles, buttons, animations
            ├── abstracts/
            │   ├── _variables.scss     Design tokens
            │   └── _mixins.scss        Responsive mixins, flex helpers
            ├── components/
            │   ├── _navbar.scss
            │   └── _assignment-card.scss
            └── pages/
                ├── _assignments.scss
                └── _studio.scss        Studio layout + attempts UI
```

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL installed locally
- MongoDB Atlas account (free tier works)
- Google Gemini API key

---

### Step 1 — Clone

```bash
git clone https://github.com/your-username/ciphersqlstudio.git
cd ciphersqlstudio
```

### Step 2 — PostgreSQL Setup

```bash
# Linux
sudo service postgresql start
sudo -u postgres psql

# macOS
brew services start postgresql
psql postgres

# Inside psql
CREATE DATABASE ciphersqlstudio_sandbox;
\q
```

### Step 3 — MongoDB Atlas Setup

1. Go to cloud.mongodb.com → free account
2. Create free M0 cluster
3. Set username and password
4. Network Access → Add IP → 0.0.0.0/0
5. Connect → Drivers → copy connection string

### Step 4 — Get Gemini API Key

1. Go to aistudio.google.com
2. Click Get API Key → Create API key
3. Copy the key

### Step 5 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=ciphersqlstudio_sandbox
PG_USER=postgres
PG_PASSWORD=yourpassword
JWT_SECRET=some_long_random_secret_string
GEMINI_API_KEY=AIzaSy...your_key
CLIENT_URL=http://localhost:3000
```

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected
✅ PostgreSQL connected
✅ PostgreSQL sandbox seeded
🚀 CipherSQLStudio API running on http://localhost:5000
```

### Step 6 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Open http://localhost:3000

---

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default 5000) |
| MONGODB_URI | MongoDB Atlas connection string | Yes |
| PG_HOST | PostgreSQL host | Yes |
| PG_PORT | PostgreSQL port | No (default 5432) |
| PG_DATABASE | PostgreSQL database name | Yes |
| PG_USER | PostgreSQL username | Yes |
| PG_PASSWORD | PostgreSQL password | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes* |
| CLIENT_URL | Frontend URL for CORS | No (default localhost:3000) |

*Without Gemini key, rule-based fallback hints are used.

### Frontend

| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API base URL |

---

## Security

- SELECT-only queries enforced — sqlValidator strips comments first then validates
- Forbidden keywords blocked — DROP, DELETE, INSERT, UPDATE, ALTER, TRUNCATE, etc.
- Statement timeout — 5 second PostgreSQL limit
- Multi-statement prevention — only one SQL per execution
- Rate limiting — 100 req/15min global, 20 req/min for query execution
- JWT authentication for protected routes

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 320px | Stacked panels, tabbed navigation |
| Tablet | 641px | Wider cards, better spacing |
| Desktop | 1024px | Side-by-side studio layout |
| Wide | 1281px | Wider left panel (380px) |

---

## Pre-loaded Assignments

6 assignments auto-seeded on first backend run:

| Title | Difficulty | Key Concepts |
|-------|-----------|-------------|
| Basic Employee SELECT | Beginner | SELECT, WHERE, ORDER BY |
| Aggregate Functions | Beginner | GROUP BY, AVG |
| Product Revenue Analysis | Intermediate | HAVING, SUM, Arithmetic |
| JOIN: Employees and Managers | Intermediate | Self-JOIN, LEFT JOIN |
| Top Scoring Students per Subject | Advanced | Subquery, CTE, Window Functions |
| Monthly Sales Report | Advanced | EXTRACT, DATE, CTE |

---

## My Attempts Feature

When logged in, every query execution is saved automatically to MongoDB.

In the Studio page:
- Click the Attempts tab in the left panel
- See all previous queries with timestamps
- Click Load to reload any past query into the editor