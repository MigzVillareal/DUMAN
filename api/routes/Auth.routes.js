import express from "express"
import * as authController from "../controllers/Auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Auth CRUD
router.post('/register', registerLimiter, authController.registerUser);
router.post('/login', loginLimiter, authController.loginUser);
router.post('/logout', authenticateToken, authController.logoutUser);

export default router;