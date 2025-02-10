// backend/routes/adminRoutes.js
import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { authAdminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authAdminMiddleware, getAdminStats);

export default router; // Corrected export for ES Modules
