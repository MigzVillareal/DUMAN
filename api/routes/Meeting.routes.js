import express from "express"
import * as meetingController from "../controllers/Meeting.controller.js";

const router = express.Router();

// Meeting CRUD
router.post("/", meetingController.createMeeting);
router.get("/:meetingId", meetingController.getMeetingById);
router.patch("/:meetingId", meetingController.updateMeeting);
router.delete("/:meetingId", meetingController.deleteMeeting);

// Status Management
router.patch("/:meetingId/status", meetingController.updateMeetingStatus);

// Related Data Operations
router.get("/:meetingId/notifications", meetingController.getMeetingNotifications);

export default router;