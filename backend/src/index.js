require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectMongoDB = require('./config/mongodb');
const { connectPostgres, initPostgresTables } = require('./config/postgres');

const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/query');
const hintRoutes = require('./routes/hints');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: 'Too many query executions, slow down.' },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryLimiter, queryRoutes);
app.use('/api/hints', hintRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CipherSQLStudio API running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Boot
async function start() {
  await connectMongoDB();
  await connectPostgres();
  await initPostgresTables();

  app.listen(PORT, () => {
    console.log(`🚀 CipherSQLStudio API running on http://localhost:${PORT}`);
  });
}

start();
