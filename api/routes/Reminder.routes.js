import express from "express";
import { send24hMeetingReminders, sendCancellationNotices } from "../controllers/Reminder.controller.js";

const router = express.Router();

router.get("/check-24h-meetings", send24hMeetingReminders);
router.get("/check-cancelled-meetings", sendCancellationNotices);

export default router;