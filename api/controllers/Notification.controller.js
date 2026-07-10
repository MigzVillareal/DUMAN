import prisma from "../lib/prisma.js";
import { send24hReminderForMeeting } from "../services/Notification.service.js";

const HOURS_BEFORE = 24;
const WINDOW_MINUTES = 15; // match/exceed your cron interval

export const send24hMeetingReminders = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    try {
        const now = new Date();
        const target = new Date(now.getTime() + HOURS_BEFORE * 60 * 60 * 1000);
        const windowStart = new Date(target.getTime() - WINDOW_MINUTES * 60 * 1000);
        const windowEnd = new Date(target.getTime() + WINDOW_MINUTES * 60 * 1000);

        const meetings = await prisma.meeting.findMany({
            where: {
                schedule: { gte: windowStart, lte: windowEnd },
                isReminded: false,
                status: { in: ["PENDING", "UPCOMING"] } // skip CANCELLED, ONGOING, FINISHED
            }
        });

        const results = [];
        for (const meeting of meetings) {
            try {
                await send24hReminderForMeeting(meeting.meetingId);
                results.push({ meetingId: meeting.meetingId, status: "sent" });
            } catch (err) {
                console.log(err);
                results.push({ meetingId: meeting.meetingId, status: "error", message: err.message });
            }
        }

        res.status(200).json({ checked: meetings.length, results });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Unable to send meeting reminders." });
    }
};