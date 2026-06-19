import express from "express"
const router = express.Router();

const authController = require('../controllers/Auth.controller.js')

routes.post('/register', authController.registerUser);
routes.post('/login', authController.loginUser);

modele.exports = Router;