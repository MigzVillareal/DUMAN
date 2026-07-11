import prisma from "../lib/prisma.js";
import { send24hReminderForMeeting } from "../services/Notification.service.js";

export const send24hMeetingReminders = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    try {
        const now = new Date();
        
        const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000); // ~20h out
        const windowEnd = new Date(now.getTime() + 32 * 60 * 60 * 1000);   // ~32h out

        const meetings = await prisma.meeting.findMany({
            where: {
                schedule: { gte: windowStart, lte: windowEnd },
                isReminded: false,
                status: { in: ["PENDING", "UPCOMING"] }
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