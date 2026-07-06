# 💰 FinTrack — Personal Finance Tracker

Full-stack MERN app with MongoDB Atlas, Express backend, and vanilla JS frontend.

---

## 🚀 Run Locally (2 steps only)

### Step 1 — Install dependencies
```bash
cd backend
npm install
```

### Step 2 — Start the server
```bash
npm run dev
```

Open browser → **http://localhost:5000**

That's it! Frontend + Backend runs on the same port.

---

## 📁 Project Structure

```
backend/
├── public/
│   └── index.html        ← Frontend (served by Express)
├── config/
│   └── db.js             ← MongoDB connection
├── controllers/          ← Business logic
│   ├── authController.js
│   ├── expenseController.js
│   ├── incomeController.js
│   ├── budgetController.js
│   └── goalController.js
├── middleware/
│   └── authMiddleware.js ← JWT protection
├── models/               ← Mongoose schemas
│   ├── User.js
│   ├── Expense.js
│   ├── Income.js
│   ├── Budget.js
│   └── Goal.js
├── routes/               ← Express routes
│   ├── authRoutes.js
│   ├── expenseRoutes.js
│   ├── incomeRoutes.js
│   ├── budgetRoutes.js
│   └── goalRoutes.js
├── utils/
│   └── generateToken.js
├── server.js             ← Entry point
├── .env                  ← Environment variables
└── package.json
```

---

## 🔗 API Endpoints

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

---

## ☁️ Deploy to Railway (Free)

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Push your backend folder to a GitHub repo first:
   ```bash
   git init
   git add .
   git commit -m "FinTrack app"
   git remote add origin https://github.com/YOUR_USERNAME/fintrack.git
   git push -u origin main
   ```
4. In Railway → select your repo → **Deploy**
5. Go to **Variables** tab → Add these:
   ```
   MONGO_URI = mongodb+srv://<user>:<password>@cluster.s53odfg.mongodb.net/fintrack
   JWT_SECRET = your_long_random_secret
   JWT_EXPIRE = 30d
   NODE_ENV = production
   GEMINI_API_KEY = your_gemini_key
   ```
6. Railway auto-detects Node.js and deploys
7. Click **"Generate Domain"** → your app is live at `https://fintrack-xxx.railway.app`

---

## ☁️ Deploy to Render (Free)

1. Go to **https://render.com** → Sign up
2. Click **"New Web Service"** → Connect GitHub repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
4. Add Environment Variables (same as Railway above)
5. Click **"Create Web Service"** → Live in ~2 minutes

---

## ☁️ Deploy to Vercel

The project is now fully configured for Vercel deployment using `@vercel/node`.
1. Go to **https://vercel.com**
2. Important: In the deployment settings, configure the environment variables as described below.
3. Deploy! Vercel will automatically detect `vercel.json` and serve the backend API and static frontend correctly.

---

## 🔐 Environment Variables

| Variable | Value |
|----------|-------|
| PORT | 5000 |
| MONGO_URI | Your Atlas connection string |
| JWT_SECRET | Any long random string |
| JWT_EXPIRE | 30d |
| NODE_ENV | production |
| GEMINI_API_KEY | Your Google Gemini API Key |
| ANTHROPIC_API_KEY | (Optional) Anthropic API Key |

---

## ✅ Features

- 🔐 JWT Authentication (Register/Login)
- 💸 Expense tracking with categories & payment methods
- 💰 Income tracking by source
- 📊 Monthly budget management with alerts
- 🎯 Savings goals with deposit tracking
- 📈 Reports & analytics with charts
- 📱 Responsive dark UI
- ⬇️ Export expenses to CSV
- 🔒 Each user sees only their own data
- 🤖 **AI Assistant**: Smart financial insights, categorization suggestions, and natural language help via Google Gemini.
- 📅 **Interactive Calendar**: Visual timeline of all income and expenses.
- 🏆 **Gamification**: Earn badges and track your financial health score.
"# Fin-Track" 
