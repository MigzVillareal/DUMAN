import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
import { format } from "date-fns";

const HOURS_BEFORE = 24;
const WINDOW_MINUTES = 15;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "duman.masaen@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function getMemberEmails(groupId) {
    const members = await prisma.groupMember.findMany({
        where: { groupId, status: "ACCEPTED" },
        include: { user: true }
    });
    return members.map(member => member.user.email).join(", ");
}

function formatMeetingTimes(meeting) {
    const fEndsAt = meeting.endsAt ? format(new Date(meeting.endsAt), 'h:mma') : null;
    const fSchedule = format(
        new Date(meeting.schedule),
        `EEEE, MMMM d, yyyy 'at' h:mma'${fEndsAt ? `-${fEndsAt}` : ''}'`
    );
    return { fEndsAt, fSchedule };
}

// --- 24h-before reminders (only for still-scheduled meetings) ---
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
                reminderSent24h: false,
                status: "SCHEDULED"
            },
            include: { group: true }
        });

        const results = [];

        for (const meeting of meetings) {
            try {
                const memberEmails = await getMemberEmails(meeting.groupId);
                const { fEndsAt, fSchedule } = formatMeetingTimes(meeting);

                await transporter.sendMail({
                    from: '"DUMAN" <duman.masaen@gmail.com>',
                    bcc: `duman.masaen@gmail.com, ${process.env.DEVS_MAIL}, ${memberEmails}`,
                    subject: `Reminder: "${meeting.title}" is tomorrow (${meeting.group.name})`,
                    html: `
                        <p>This is a reminder that you have an upcoming meeting on ${fSchedule}.</p>
                        <p><strong>Meeting details:</strong></p>
                        <ul>
                            <li><strong>Title:</strong> ${meeting.title}</li>
                            <li><strong>Description:</strong> ${meeting.description || "No description set."}</li>
                            <li><strong>Group:</strong> ${meeting.group.name}</li>
                            <li><strong>Date:</strong> ${format(new Date(meeting.schedule), 'MMMM d, yyyy')}</li>
                            <li><strong>Time:</strong> ${format(new Date(meeting.schedule), `h:mma'${fEndsAt ? `-${fEndsAt}` : ''}'`)}</li>
                            <li><strong>Place:</strong> ${meeting.building}${meeting.roomNumber ? `, Room ${meeting.roomNumber}` : ""}</li>
                        </ul>
                    `,
                });

                await prisma.meeting.update({
                    where: { id: meeting.id },
                    data: { reminderSent24h: true }
                });

                results.push({ meetingId: meeting.id, status: "reminder_sent" });
            } catch (err) {
                console.log(err);
                results.push({ meetingId: meeting.id, status: "error", message: err.message });
            }
        }

        res.status(200).json({ checked: meetings.length, results });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Unable to send meeting reminders." });
    }
};

export const sendCancellationNotices = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    try {
        const meetings = await prisma.meeting.findMany({
            where: {
                status: "CANCELLED",
                cancellationSent: false
            },
            include: { group: true }
        });

        const results = [];

        for (const meeting of meetings) {
            try {
                const memberEmails = await getMemberEmails(meeting.groupId);
                const { fSchedule } = formatMeetingTimes(meeting);

                await transporter.sendMail({
                    from: '"DUMAN" <duman.masaen@gmail.com>',
                    bcc: `duman.masaen@gmail.com, ${process.env.DEVS_MAIL}, ${memberEmails}`,
                    subject: `Cancelled: "${meeting.title}" (${meeting.group.name})`,
                    html: `
                        <p>The meeting originally scheduled for ${fSchedule} has been <strong>cancelled</strong>.</p>
                        <ul>
                            <li><strong>Title:</strong> ${meeting.title}</li>
                            <li><strong>Group:</strong> ${meeting.group.name}</li>
                        </ul>
                    `,
                });

                await prisma.meeting.update({
                    where: { id: meeting.id },
                    data: { cancellationSent: true }
                });

                results.push({ meetingId: meeting.id, status: "cancellation_sent" });
            } catch (err) {
                console.log(err);
                results.push({ meetingId: meeting.id, status: "error", message: err.message });
            }
        }

        res.status(200).json({ checked: meetings.length, results });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Unable to send cancellation notices." });
    }
};