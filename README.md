# Shadow Vault — Dark Finance Tracker

Full-stack MERN finance tracker with React + Vite frontend, dark cyberpunk UI, cinematic lightning storm animations, gamification, and AI assistant.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite, CSS (custom properties), Canvas API |
| Backend | Node.js, Express |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Google Gemini API |
| Charts | Chart.js + react-chartjs-2 |
| Routing | react-router-dom v7 |
| Deployment | Vercel |

---

## Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)

### 1. Clone & install
```bash
git clone https://github.com/karthikeyan-rj/shadow-vault.git
cd shadow-vault

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment variables
Create `/server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/shadow-vault
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_key
PORT=5000
```

Create `/client/.env`:
```
VITE_API_URL=http://localhost:5000
```

### 3. Start development
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** — backend runs on **http://localhost:5000**.

---

## Project Structure

```
shadow-vault/
├── client/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/        # Bar, Line, Pie charts (Chart.js)
│   │   │   ├── effects/
│   │   │   │   └── storm/     # Lightning generator, renderer, physics, variants
│   │   │   │   └── AnimatedStormBackground.jsx
│   │   │   ├── layout/        # AppLayout, Topbar, MissionBoardMenu, ChatFab
│   │   │   ├── profile/       # ProfileHeader, ProfileRankPanel, etc.
│   │   │   ├── tasks/         # TaskCard, TaskForm, TaskSummary
│   │   │   └── ui/            # Card, Button, Modal, StatCard, Badge, etc.
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useTasks, useProfileData, useAsyncData, useToast
│   │   ├── pages/             # All route pages (13 pages)
│   │   ├── services/          # API client, taskService
│   │   ├── styles/
│   │   │   └── globals.css    # Theme, electric animations, layout
│   │   ├── utils/             # Constants, helpers
│   │   ├── App.jsx            # Router + protected routes
│   │   └── main.jsx           # Entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Auth, Income, Expense, Budget, Goal, Bill, Task, Chat, Gamification, AI
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protection
│   ├── models/                # All Mongoose schemas
│   ├── routes/                # All Express routes
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js              # Entry point
│   └── package.json
├── .env.example
├── .gitignore
├── Procfile
├── package.json               # Root scripts (optional)
└── vercel.json                # Vercel deployment config
```

---

## Features

### Core Finance
- **Expense tracking** with categories & payment methods
- **Income tracking** by source
- **Monthly budget management** with progress alerts
- **Savings goals** with deposit tracking
- **Recurring bills** with status tracking
- **Transfer** between accounts
- **Reports & analytics** with interactive charts
- **CSV export** for expenses

### Visual & UX
- **Cinematic lightning storm** — Canvas-rendered realistic lightning with dual-peak flicker, atmospheric flash wash, sky charge breathing, natural branch disintegration
- **Electric surface animations** — Subtle current-crawling CSS effects on all cards, panels, and buttons
- **Dark cyberpunk UI** with glassmorphism, reflex gradients, and glow effects
- **Responsive** — works on desktop and tablet
- **`prefers-reduced-motion`** respected throughout

### Gamification
- **Mission Board** — animated quests with SVG electric field, progress tracking, rewards
- **Achievements** — badge system for financial milestones
- **Health score** — financial wellness rating
- **Level & XP** — level-up progression

### AI & Automation
- **AI Assistant** — natural language queries powered by Google Gemini
- **Smart categorization** suggestions
- **Financial insights** based on spending patterns

### Security
- **JWT authentication** with protected routes
- **Data isolation** — each user sees only their own data
- **No secrets in code** — all credentials via environment variables

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/expenses | Get all / Create expense |
| PUT/DELETE | /api/expenses/:id | Update / Delete expense |
| GET/POST | /api/income | Get all / Create income |
| PUT/DELETE | /api/income/:id | Update / Delete income |
| GET/POST | /api/budgets | Get all / Create budget |
| PUT/DELETE | /api/budgets/:id | Update / Delete budget |
| GET/POST | /api/goals | Get all / Create goal |
| PUT/DELETE | /api/goals/:id | Update / Delete goal |
| PATCH | /api/goals/:id/deposit | Add money to goal |
| GET/POST | /api/bills | Get all / Create bill |
| PUT/DELETE | /api/bills/:id | Update / Delete bill |
| GET/POST | /api/tasks | Get all / Create task |
| PUT/DELETE | /api/tasks/:id | Update / Delete task |
| GET | /api/gamification/profile | Get gamification data |
| POST | /api/chat/message | Send AI chat message |
| POST | /api/ai/categorize | AI categorization |

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `GEMINI_API_KEY` | Google Gemini API key |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (e.g. `http://localhost:5000`) |

---

## Deployment (Vercel)

The project includes `vercel.json` and `Procfile` for Vercel deployment.

1. Push to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects the config

---
