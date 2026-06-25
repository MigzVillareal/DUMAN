import express from "express"
import * as meetingController from "../controllers/Meeting.controller.js";

const router = express.Router();

// Meeting CRUD
router.get("/", meetingController.createMeeting);
router.get("/", meetingController.getAllMeetingsByUserId);
router.get("/:meetingId", meetingController.getMeetingById);
router.get("/:meetingId", meetingController.updateMeeting);
router.get("/:meetingId", meetingController.deleteMeeting);

// Status Management
router.get("/:meetingId/status", meetingController.updateMeetingStatus);

// Related Data Operations
router.get("/:meetingId/notifications", meetingController.getMeetingNotifications);

export default router;