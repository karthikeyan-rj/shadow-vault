const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/expenses',      require('./routes/expenseRoutes'));
app.use('/api/income',        require('./routes/incomeRoutes'));
app.use('/api/budgets',       require('./routes/budgetRoutes'));
app.use('/api/goals',         require('./routes/goalRoutes'));
app.use('/api/bills',         require('./routes/billRoutes'));
app.use('/api/ai',            require('./routes/aiRoutes'));
app.use('/api/gamification',  require('./routes/gamificationRoutes'));
app.use('/api/chat',          require('./routes/chatRoutes'));
app.use('/api/tasks',         require('./routes/taskRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'ShadowVault API Running' }));

// Serve React frontend in production
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error: ' + err.message });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`ShadowVault Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
