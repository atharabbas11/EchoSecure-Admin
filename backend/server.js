//server.js
// require("dotenv").config();
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import connectDB from './config/db.js';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true,}));
console.log('CLIENT_URL:', process.env.CLIENT_URL);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/users", adminUserRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







































// const crypto = require('crypto');

// // Generate a secure random string for your JWT secret
// const JWT_SECRET = crypto.randomBytes(64).toString('hex');
// const JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('hex');

// console.log('JWT_SECRET:', JWT_SECRET);
// console.log('JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET);
