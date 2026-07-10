import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
import { format } from "date-fns";

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

export async function getMemberEmails(groupId) {
    const members = await prisma.groupMember.findMany({
        where: { groupId, status: "ACCEPTED" },
        include: { user: true }
    });
    return members.map(m => m.user.email).join(", ");
}

export function formatMeetingTimes(meeting) {
    const fEndsAt = meeting.endsAt ? format(new Date(meeting.endsAt), 'h:mma') : null;
    const fSchedule = format(
        new Date(meeting.schedule),
        `EEEE, MMMM d, yyyy 'at' h:mma'${fEndsAt ? `-${fEndsAt}` : ''}'`
    );
    return { fEndsAt, fSchedule };
}

// Sends the cancellation email. No DB logging beyond the meeting itself.
export async function sendCancellationNoticeForMeeting(meetingId) {
    const meeting = await prisma.meeting.findUnique({
        where: { meetingId },
        include: { group: true }
    });

    if (!meeting) throw new Error("Meeting not found");

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
}

// Sends the 24h-before reminder and marks isReminded true.
export async function send24hReminderForMeeting(meetingId) {
    const meeting = await prisma.meeting.findUnique({
        where: { meetingId },
        include: { group: true }
    });

    if (!meeting) throw new Error("Meeting not found");

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
        where: { meetingId: meeting.meetingId },
        data: { isReminded: true }
    });
}