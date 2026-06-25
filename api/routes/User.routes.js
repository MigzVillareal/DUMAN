import express from "express"
import * as userController from "../controllers/User.controller.js";

const router = express.Router();

// User CRUD
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;