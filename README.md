# 💰 FinanceAI — AI-Powered Personal Finance Tracker

A full-stack personal finance tracker with AI-generated spending insights, beautiful dark glassmorphism UI, and real-time data visualization.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 💸 **Transaction Management** — Add and track income & expenses by category
- 📊 **Data Visualization** — Donut chart for expense breakdown, bar chart for income vs expenses
- 🤖 **AI Financial Insights** — Gemini AI analyzes your spending and gives personalized advice
- 🌙 **Dark Glassmorphism UI** — Modern dark theme with blur effects, gradient accents, and smooth animations
- 🛡️ **Protected Routes** — Unauthenticated users are redirected to login automatically

---

## 🖥️ Screenshots

> Dashboard with real-time charts, transaction list, and AI insights panel

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM for database models |
| Pydantic | Data validation & schemas |
| JWT + bcrypt | Authentication & password hashing |
| Google Gemini API | AI-powered financial insights |

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | Frontend framework |
| Axios | HTTP client for API calls |
| React Router | Client-side routing |
| Recharts | Data visualization (charts) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/YOURUSERNAME/ai-finance-tracker.git
cd ai-finance-tracker
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/finance_tracker
SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Create the PostgreSQL database:
```sql
CREATE DATABASE finance_tracker;
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📁 Project Structure

```
ai-finance-tracker/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py      # DB connection & session
│   │   │   └── security.py      # JWT & password hashing
│   │   ├── models/
│   │   │   ├── user.py          # User table
│   │   │   └── transaction.py   # Transaction table
│   │   ├── routes/
│   │   │   ├── auth.py          # Register & login endpoints
│   │   │   ├── transactions.py  # CRUD transaction endpoints
│   │   │   └── ai.py            # Gemini AI insights endpoint
│   │   ├── schemas/
│   │   │   ├── user.py          # User request/response schemas
│   │   │   └── transaction.py   # Transaction schemas
│   │   └── main.py              # FastAPI app entry point
│   ├── requirements.txt
│   └── .env                     # (not committed)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Charts.jsx        # Recharts pie & bar charts
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        ├── api.js                # Axios instance with JWT interceptor
        └── App.jsx
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Login and receive JWT token |

### Transactions
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/transactions/` | Add a new transaction | ✅ |
| GET | `/transactions/` | Get all user transactions | ✅ |
| GET | `/transactions/summary` | Get income, expense & balance totals | ✅ |

### AI
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/ai/insights` | Get AI-generated financial advice | ✅ |

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Secret key for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key (free tier) |

---

## 📦 Installation Summary

```bash
# Backend dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
pip install passlib[bcrypt] python-jose[cryptography] google-genai
pip install "pydantic[email]" bcrypt==4.0.1

# Frontend dependencies
npm install axios react-router-dom recharts
```

---

## 🧑‍💻 Author

**Aryan Thakre**
- GitHub: [@heymayday01](https://github.com/heymayday01)


---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
