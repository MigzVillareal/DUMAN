import express from "express";
import { send24hMeetingReminders } from "../controllers/Notification.controller.js";

const router = express.Router();
router.get("/check-24h-meetings", send24hMeetingReminders);

export default router;