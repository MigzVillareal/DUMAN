import express from "express";
import * as notificationController from "../controllers/Notification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/check-24h-meetings", notificationController.send24hMeetingReminders);
router.get("/:userId", authenticateToken, notificationController.getUserNotifications);
router.patch("/:notificationId/read", authenticateToken, notificationController.markNotificationAsRead);

export default router;