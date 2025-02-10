//routes/authRoutes.js
import express from 'express';
import { loginAdmin, registerAdmin, logoutAdmin, verifyOTPAndLogin, sendOTP, verifyOTPController } from '../controllers/authController.js';
import { authAdminMiddleware } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
import Session from '../models/sessionModel.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/csrf-token', async (req, res) => {
  try {
    const { sessionId } = req.cookies;
    console.log('Session ID:', sessionId); // Debugging log
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID missing' });
    }

    const session = await Session.findOne({ sessionId });
    console.log('Session from DB:', session); // Debugging log
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.status(200).json({ csrfToken: session.csrfToken });
  } catch (error) {
    console.error('CSRF Token Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check Auth Status
router.get('/check-auth', async (req, res) => {
    try {
      const { accessToken, sessionId } = req.cookies;
      console.log('Cookies:', req.cookies); // Debugging
      if (!accessToken || !sessionId) {
        console.log('Missing accessToken or sessionId'); // Debugging
        return res.status(401).json({ authenticated: false });
      }
  
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET); // Fix: jwt is now defined
      console.log('Decoded Token:', decoded); // Debugging
  
      const session = await Session.findOne({ userId: decoded.userId, sessionId });
      console.log('Session from DB:', session); // Debugging

      if (!session) {
        console.log('Invalid session'); // Debugging
        return res.status(401).json({ authenticated: false });
      }
  
      res.status(200).json({ authenticated: true });
    } catch (error) {
      console.error('Check Auth Error:', error); // Debugging
      res.status(401).json({ authenticated: false });
    }
});
  
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.post('/logout', authAdminMiddleware, logoutAdmin);

router.post('/verify-otp', verifyOTPAndLogin);

export default router; // Corrected export for ES Modules
