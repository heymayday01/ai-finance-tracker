<div align="center">

```
███████╗██╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗███████╗ █████╗ ██╗
██╔════╝██║████╗  ██║██╔══██╗████╗  ██║██╔════╝██╔════╝██╔══██╗██║
█████╗  ██║██╔██╗ ██║███████║██╔██╗ ██║██║     █████╗  ███████║██║
██╔══╝  ██║██║╚██╗██║██╔══██║██║╚██╗██║██║     ██╔══╝  ██╔══██║██║
██║     ██║██║ ╚████║██║  ██║██║ ╚████║╚██████╗███████╗██║  ██║██║
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝
```

### *Your money. Your data. Your AI.*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff88?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00d4ff?style=flat-square)](https://github.com/heymayday01/ai-finance-tracker/pulls)
[![Made with ❤️](https://img.shields.io/badge/Made_with-❤️-ff6b6b?style=flat-square)](https://github.com/heymayday01)
[![Status](https://img.shields.io/badge/Status-Active-00ff88?style=flat-square)]()

</div>

<br/>

---

<br/>

## ◈ What is FinanceAI?

> **FinanceAI** is a full-stack, AI-powered personal finance tracker built to give you complete visibility over your money — with the help of Google Gemini, real-time charts, and a glassmorphism UI that makes budgeting feel less like a chore and more like a superpower.

Track income. Audit expenses. Let AI tell you where your money is actually going.

<br/>

---

<br/>

## ◈ Screenshots

<br/>

<div align="center">

### 🌌 Stats, Charts & Overview

<img src="screenshot-overview.png" alt="FinanceAI — Stats overview with income, expenses, balance cards and live charts" width="100%" />

<br/>
<sub>← Income · Expense · Balance stat cards with progress bars &nbsp;|&nbsp; Expense donut chart &nbsp;|&nbsp; Income vs Expenses bar chart →</sub>

<br/><br/><br/>

### 💸 Transactions · AI Insights · Quick Stats

<img src="screenshot-transactions.png" alt="FinanceAI — Transaction timeline with AI insights panel and quick stats sidebar" width="100%" />

<br/>
<sub>← Transaction timeline with colour-coded dots &nbsp;|&nbsp; Search & filter bar &nbsp;|&nbsp; AI Insights panel &nbsp;|&nbsp; Quick Stats sidebar →</sub>

<br/><br/><br/>

### 🔍 Scrolled View — Timeline Detail

<img src="screenshot-mobile.png" alt="FinanceAI — Close-up of transaction list and AI sidebar" width="100%" />

<br/>
<sub>← Scrolled dashboard state showing the full transaction list & AI idle state →</sub>

</div>

<br/>

---

<br/>

## ◈ Feature Highlights

<br/>

| ✦ | Feature | What it does |
|---|---|---|
| 🔐 | **JWT Authentication** | Secure register & login with bcrypt hashing — no plain-text passwords, ever |
| 💸 | **Transaction Engine** | Add, filter, search, and delete income & expense entries in real time |
| 📊 | **Live Visualizations** | Donut chart for expense breakdown · Bar chart for income vs expense vs balance |
| 🤖 | **AI Spending Insights** | Gemini AI reads your transaction history and surfaces personalised financial advice |
| 🌌 | **Glassmorphism UI** | Dark void background · floating starfield · blur-glass cards · smooth staggered animations |
| 🛡️ | **Protected Routes** | All financial data is user-scoped — unauthenticated requests are bounced immediately |
| 📈 | **Quick Stats Panel** | Savings rate · top spend category · average transaction · total count — always visible |
| 🎯 | **Search & Filter** | Real-time search with type filters (All · Income · Expense) |

<br/>

---

<br/>

## ◈ Tech Stack

<br/>

### ⬡ Backend

```
FastAPI          →  High-performance async REST API
PostgreSQL       →  Relational database with full ACID compliance
SQLAlchemy       →  ORM with declarative models
Pydantic v2      →  Request/response validation & serialization
JWT + bcrypt     →  Stateless auth with secure password hashing
Google Gemini    →  LLM for AI-powered financial analysis
Uvicorn          →  ASGI server for production-grade performance
```

### ⬡ Frontend

```
React 19 (Vite)  →  Lightning-fast frontend with HMR
Axios            →  HTTP client with JWT interceptor
React Router v6  →  Declarative client-side routing
Recharts         →  Composable SVG chart library
DM Mono          →  Monospace font for financial data
Unbounded        →  Display font for headings
Manrope          →  Body font for readable prose
```

<br/>

---

<br/>

## ◈ Project Structure

```
ai-finance-tracker/
│
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── 📂 core/
│   │   │   ├── database.py       ← DB connection & session factory
│   │   │   └── security.py       ← JWT signing & bcrypt hashing
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── user.py           ← User ORM model
│   │   │   └── transaction.py    ← Transaction ORM model
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── auth.py           ← POST /auth/register · /auth/login
│   │   │   ├── transactions.py   ← GET/POST/DELETE /transactions/
│   │   │   └── ai.py             ← GET /ai/insights (Gemini)
│   │   │
│   │   ├── 📂 schemas/
│   │   │   ├── user.py           ← UserCreate, UserResponse
│   │   │   └── transaction.py    ← TransactionCreate, TransactionResponse
│   │   │
│   │   └── main.py               ← FastAPI app entry point + CORS
│   │
│   ├── requirements.txt
│   └── .env                      ← (not committed — see below)
│
└── 📂 frontend/
    └── 📂 src/
        ├── 📂 components/
        │   ├── Charts.jsx         ← Recharts pie & bar chart components
        │   ├── AnimatedCounter.jsx
        │   ├── ConfettiBurst.jsx
        │   ├── Skeleton.jsx
        │   └── Toast.jsx
        │
        ├── 📂 pages/
        │   ├── Dashboard.jsx      ← Main app view
        │   ├── Login.jsx
        │   └── Register.jsx
        │
        ├── api.js                 ← Axios instance with auth interceptor
        └── App.jsx                ← Routes + ProtectedRoute wrapper
```

<br/>

---

<br/>

## ◈ API Reference

<br/>

### Authentication

```
POST  /auth/register    →  Create account         body: { name, email, password }
POST  /auth/login       →  Get JWT token           body: { email, password }
```

### Transactions  `🔒 Bearer token required`

```
POST    /transactions/          →  Add transaction      body: { type, amount, category, description }
GET     /transactions/          →  List all             returns: Transaction[]
GET     /transactions/summary   →  Totals               returns: { total_income, total_expense, balance }
DELETE  /transactions/{id}      →  Delete by ID
```

### AI  `🔒 Bearer token required`

```
GET  /ai/insights    →  Gemini-generated markdown analysis of spending patterns
```

<br/>

---

<br/>

## ◈ Getting Started

<br/>

### Prerequisites

```bash
python --version   # 3.10 or higher
node --version     # 18 or higher
psql --version     # PostgreSQL 14+
```

<br/>

### 1 · Clone

```bash
git clone https://github.com/heymayday01/ai-finance-tracker.git
cd ai-finance-tracker
```

### 2 · Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac / Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/finance_tracker
SECRET_KEY=your_super_secret_key_here_make_it_long
GEMINI_API_KEY=your_gemini_api_key_here
```

Create the database:

```sql
CREATE DATABASE finance_tracker;
```

Start the server:

```bash
uvicorn app.main:app --reload
# → Running at  http://localhost:8000
# → Swagger UI  http://localhost:8000/docs
```

### 3 · Frontend

```bash
cd frontend
npm install
npm run dev
# → Running at http://localhost:5173
```

<br/>

---

<br/>

## ◈ Environment Variables

<br/>

| Variable | Where to get it | Required |
|---|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string | ✅ |
| `SECRET_KEY` | Any long random string (32+ chars) | ✅ |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) — free tier available | ✅ |

<br/>

---

<br/>

## ◈ Deployment

<br/>

```
Frontend  →  Vercel       (connect GitHub repo, zero-config deploy)
Backend   →  Render       (set env vars, auto-deploy on push)
Database  →  Supabase     (managed PostgreSQL, generous free tier)
```

> **Tip:** Update the `CORS` origins in `main.py` to your Vercel deployment URL before pushing to production.

<br/>

---

<br/>

## ◈ Installation Cheatsheet

```bash
# Backend
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv \
            passlib[bcrypt] python-jose[cryptography] google-genai \
            "pydantic[email]" bcrypt==4.0.1

# Frontend
npm install axios react-router-dom recharts date-fns react-markdown
```

<br/>

---

<br/>

## ◈ Roadmap

```
✅  Core transaction CRUD
✅  JWT auth with bcrypt
✅  Recharts visualizations
✅  Gemini AI insights
✅  Glassmorphism UI + starfield canvas
✅  Timeline transaction list
✅  Quick stats sidebar
✅  Savings rate + progress bars
⬜  Monthly budget goals & alerts
⬜  CSV / PDF export
⬜  Recurring transaction detection
⬜  Mobile app (React Native)
⬜  Multi-currency support
```

<br/>

---

<br/>

## ◈ Author

<br/>

<div align="center">

**Built by Aryan Thakre**

[![GitHub](https://img.shields.io/badge/GitHub-@heymayday01-181717?style=for-the-badge&logo=github)](https://github.com/heymayday01)

*"Track everything. Understand more. Stress less."*

</div>

<br/>

---

<br/>

<div align="center">

**FinanceAI** · MIT License · Made with 🖤 and too much coffee

*If this helped you, a ⭐ means a lot.*

</div>