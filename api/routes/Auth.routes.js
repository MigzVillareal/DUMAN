import express from "express"
import * as authController from "../controllers/Auth.controller.js";

const router = express.Router();

// Auth CRUD
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

export default router;