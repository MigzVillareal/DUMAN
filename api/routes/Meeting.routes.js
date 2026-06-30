import express from "express"
import * as meetingController from "../controllers/Meeting.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Meeting CRUD
router.post("/", authenticateToken, meetingController.createMeeting);
router.get("/:meetingId", authenticateToken, meetingController.getMeetingById);
router.patch("/:meetingId", authenticateToken, meetingController.updateMeeting);
router.delete("/:meetingId", authenticateToken, meetingController.deleteMeeting);

// Status Management
router.patch("/:meetingId/status", authenticateToken, meetingController.updateMeetingStatus);

// Related Data Operations
router.get("/:meetingId/notifications", authenticateToken, meetingController.getMeetingNotifications);

export default router;