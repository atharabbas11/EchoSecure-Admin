import express from 'express';
import { getAllUsers, createUser, deleteUser, updateUserEmail } from '../controllers/adminUserController.js'; // Correct import
import { authAdminMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get("/", authAdminMiddleware, getAllUsers);
router.post("/", authAdminMiddleware, createUser);
router.delete("/:id", authAdminMiddleware, deleteUser);
router.put("/:id/email", authAdminMiddleware, updateUserEmail);

export default router; // Corrected export for ES Modules
