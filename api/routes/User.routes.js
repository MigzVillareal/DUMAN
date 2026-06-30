import express from "express"
import * as userController from "../controllers/User.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// User CRUD
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

// Related Data Operations
router.get("/:userId/invites", authenticateToken, userController.getUserInvites);
router.get("/:userId/meetings", authenticateToken, userController.getUserMeetings);
router.get("/:userId/meeting", authenticateToken, userController.getUserMeeting);

export default router;