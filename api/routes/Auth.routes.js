import express from "express"
import * as authController from "../controllers/Auth.controller.js";

const router = express.Router();

routes.post('/register', authController.registerUser);
routes.post('/login', authController.loginUser);
routes.post('/logout', authController.logoutUser);

export default router;