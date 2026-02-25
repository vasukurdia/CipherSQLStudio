# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## 📸 Features

- **Assignment Listing** — Browse assignments by difficulty (Beginner / Intermediate / Advanced)
- **SQL Studio** — Monaco Editor with syntax highlighting, auto-complete, and Ctrl+Enter to run
- **Real-time Execution** — Queries run against a PostgreSQL sandbox with results in a formatted table
- **Schema & Sample Data Viewer** — See table schemas and preview data before writing queries
- **LLM Hints** — Get contextual hints (not solutions) powered by OpenAI / Gemini
- **Auth System** — Register/login to save query attempt history
- **Mobile Responsive** — Works on 320px → desktop, mobile-first SCSS

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, SCSS (vanilla), Monaco Editor |
| Backend | Node.js, Express.js |
| Sandbox DB | PostgreSQL |
| Persistence DB | MongoDB (Atlas) |
| LLM | Google Gemini (`gemini-2.0-flash`) |

---

## 📁 Project Structure

```
ciphersqlstudio/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connections (MongoDB, PostgreSQL)
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # SQL validator
│   │   └── index.js         # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── hooks/           # useAuth context
    │   ├── pages/           # AssignmentsPage, StudioPage, Auth pages
    │   ├── services/        # Axios API layer
    │   ├── styles/
    │   │   ├── abstracts/   # _variables.scss, _mixins.scss
    │   │   ├── components/  # Component SCSS
    │   │   ├── pages/       # Page SCSS
    │   │   └── main.scss    # Global styles + utilities
    │   ├── App.jsx
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL (local or hosted)
- MongoDB Atlas account (free tier works)
- OpenAI or Gemini API key (optional - fallback hints work without)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ciphersqlstudio.git
cd ciphersqlstudio
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=ciphersqlstudio_sandbox
PG_USER=postgres
PG_PASSWORD=yourpassword
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...       # Optional but recommended
CLIENT_URL=http://localhost:3000
```

#### PostgreSQL Setup

```bash
psql -U postgres
CREATE DATABASE ciphersqlstudio_sandbox;
\q
```

The backend will auto-create tables and seed sample data on first run.

#### Start backend:

```bash
npm run dev   # development (with nodemon)
# OR
npm start     # production
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start frontend:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend port | No (default 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PG_HOST` | PostgreSQL host | Yes |
| `PG_PORT` | PostgreSQL port | No (default 5432) |
| `PG_DATABASE` | PostgreSQL database name | Yes |
| `PG_USER` | PostgreSQL user | Yes |
| `PG_PASSWORD` | PostgreSQL password | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiry | No (default 7d) |
| `GEMINI_API_KEY` | Google Gemini API key for hints | Yes* |

*Without a Gemini key, the app uses rule-based fallback hints.

### Frontend

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 🔒 Security Features

- **SQL Validation**: Only `SELECT` and `WITH...SELECT` queries allowed
- **Forbidden Keywords**: DROP, DELETE, INSERT, UPDATE, ALTER, etc. blocked
- **Statement Timeout**: 5-second PostgreSQL timeout prevents long-running queries
- **Multi-statement Prevention**: Only one SQL statement per execution
- **Rate Limiting**: API limited to 100 req/15min; query execution limited to 20 req/min
- **JWT Authentication**: Stateless auth for protected routes

---

## 📊 Data-Flow Diagram

See `data-flow-diagram.jpg` in the repository root (hand-drawn as required).

**Flow: User clicks "Run Query"**

```
User types query in Monaco Editor
    ↓
Click "Run Query" / Ctrl+Enter
    ↓
React state update: setQueryLoading(true)
    ↓
axios POST /api/query/execute { query, assignmentId }
    ↓
Express rate limiter middleware
    ↓
optionalAuth middleware (attach user if token present)
    ↓
queryController.executeQuery()
    ↓
validateQuery() — check for forbidden keywords, SELECT-only
    ↓
sanitizeQuery() — strip trailing semicolons
    ↓
pg pool.connect() → SET statement_timeout = 5000
    ↓
pool.query(cleanQuery)
    ↓ (if success)
Return { columns, rows, rowCount, duration }
    ↓
If user logged in → save attempt to MongoDB User.attempts
    ↓
Response 200 JSON → React sets result state
    ↓ (if error)
PostgreSQL error → Response 422 { error, detail, hint }
    ↓
React renders ResultsTable with data or error
    ↓
setQueryLoading(false)
```

---

## 🎨 Technology Choices

- **React** — Component-based UI, perfect for the multi-panel studio layout
- **Vanilla SCSS** — Required; used variables, mixins, nesting, BEM-style naming, and partials
- **Monaco Editor** — VSCode's editor in-browser with SQL syntax highlighting
- **PostgreSQL** — ACID-compliant, excellent SQL standard support for a learning sandbox
- **MongoDB** — Flexible schema ideal for storing assignments with varying table schemas and user attempt history
- **Express.js** — Minimal, fast, great middleware ecosystem
- **JWT** — Stateless auth, no session storage needed

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 320px | Stacked panels, tabbed navigation |
| Tablet | 641px | Wider cards, better spacing |
| Desktop | 1024px | Side-by-side studio layout |
| Wide | 1281px | Wider left panel |
