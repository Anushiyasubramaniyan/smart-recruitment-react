/* =====================================================
   SMART RECRUIT AI — BACKEND SERVER ENTRY POINT
===================================================== */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Global Middleware ---------- */
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ---------- Health check ---------- */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SmartRecruit AI API is running.', timestamp: new Date().toISOString() });
});

/* ---------- API Routes ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/admin', adminRoutes);

/* ---------- 404 handler ---------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

/* ---------- Global error handler ---------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

/* ---------- Start server ---------- */
app.listen(PORT, async () => {
  console.log('=================================================');
  console.log(`🚀 SmartRecruit AI backend running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}/api/health`);
  console.log('=================================================');
  await testConnection();
});
