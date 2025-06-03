// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const listEndpoints = require('express-list-endpoints');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined. Please set it in your .env file.");
  process.exit(1);
}

// ✅ Allowed Origins for CORS
const allowedOrigins = [FRONTEND_URL];

// 🛡️ Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⏱️ Timeout Middleware
app.use((req, res, next) => {
  res.setTimeout(80000, () => {
    console.error('⏰ Request timed out.');
    res.status(408).json({ message: 'Request Timeout', error: true, success: false });
  });
  next();
});

// 🌐 API Routes
const userRoutes = require('./routes/userRoutes'); // Add more as needed
app.use('/api/users', userRoutes);

// 🏠 Root route
app.get('/', (req, res) => {
  res.send('💖 Matrimonial App Backend API Running');
});

// 🔌 Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.table(listEndpoints(app));
    });
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// 🚨 Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unknown error occurred',
    error: true,
  });
});

module.exports = app; // For Vercel
