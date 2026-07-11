import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
import { format } from 'date-fns';
// import { dmmfToRuntimeDataModel } from '../prisma/generated/runtime/client';
// import { sendNotificationEmail } from '../services/email.service.js';
import supabase from "../lib/supabase.js";
import { sendCancellationNoticeForMeeting } from "../services/Notification.service.js";
import { createInAppNotification } from '../services/In-App.Notification.service.js';

// Meeting CRUD

export const createMeeting = async (req, res) => {
    try {
        const { title, description, building, roomNumber, schedule, endsAt, groupId } = req.body;

        const meeting = await prisma.meeting.create({
            data: {
                title,
                description,
                building,
                roomNumber,
                schedule: new Date(schedule),
                endsAt: endsAt ? new Date(endsAt) : null,
                groupId: parseInt(groupId)
            },
            include: { group: true}
        });

        const members = await prisma.groupMember.findMany({
            where: { 
                groupId: parseInt(groupId),
                status: "ACCEPTED"
             },
            include: { user: true}
        });

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

        const fEndsAt = endsAt ? format(new Date(endsAt), 'h:mma'): null;
        const fSchedule = format(new Date(schedule), `EEEE, MMMM d, yyyy 'at' h:mma'-${fEndsAt}'`);

        const memberEmails = members.map(member => member.user.email).join(", ");

        const info = await transporter.sendMail({
            from: '"DUMAN" <duman.masaen@gmail.com>',
            bcc: `duman.masaen@gmail.com, ${process.env.DEVS_MAIL}, ${memberEmails}`,
            subject: `Meeting scheduled: "${title}" (${meeting.group.name})`,
            html:   `
                    <p>You have an upcoming meeting on ${fSchedule}.</p>
                    <p><strong>Meeting details:</strong></p>    
                    <ul>
                        <li><strong>Title:</strong> ${title}</li>
                        <li><strong>Description:</strong> ${description || "No description set."}</li>
                        <li><strong>Group:</strong> ${meeting.group.name}</li>
                        <li><strong>Date:</strong> ${format(new Date(schedule), 'MMMM d, yyyy')}</li>
                        <li><strong>Time:</strong> ${format(new Date(schedule), `h:mma'-${fEndsAt}'`)}</li>
                        <li><strong>Place:</strong> ${building}${roomNumber ? `, Room ${roomNumber}` : ""}</li>
                    </ul>
                    `,
        });

        await createInAppNotification(memberIds, {
            groupId: parseInt(groupId),
            meetingId: meeting.meetingId,
            title: `New Meeting: ${title}`,
            body: `A meeting has been scheduled for ${fSchedule}`
        });
        
        res.status(201).json({ meeting });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Unable to create meeting." });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const meeting = await prisma.meeting.findUnique({
            where: { meetingId: parseInt(meetingId) },
            include: {
                setter: true,
                groupId: true,
                notifications: true,
            },
        });

        if (!meeting) {
            return res.status(404).json({ errorMessage: "Meeting not found." });
        }

        res.status(200).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get meeting." });
    }
};

export const updateMeeting = async (req, res) => {
    try { 
        const { meetingId } = req.params;
        const { title, description } = req.body;

        const meeting = await prisma.meeting.update({
            where: { meetingId: parseInt(meetingId) },
            data: {
                title,
                description,
            },
        });

        const members = await prisma.groupMember.findMany({
            where: { groupId: meeting.groupId, status: "ACCEPTED"}
        });

        const memberIds = members.map(member => member.memberId);

        await createInAppNotification(memberIds, {
            groupId: meeting.groupId,
            meetingId: meeting.meetingId,
            title: "Meeting Update",
            body: `Meeting details have been updated.`
        });

        res.status(200).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to update meeting." });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        await prisma.meeting.delete({
            where: { meetingId: parseInt(meetingId) },
        });

        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to delete meeting." });
    }
};

// Status Management

export const updateMeetingStatus = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status } = req.body;
        const id = parseInt(meetingId);

        const existing = await prisma.meeting.findUnique({ where: { meetingId: id } });
        if (!existing) {
            return res.status(404).json({ errorMessage: "Meeting not found." });
        }

        const meeting = await prisma.meeting.update({
            where: { meetingId: id },
            data: { status }
        });

        if (status === "UPCOMING" && existing.status === "PENDING") {
            await createInAppNotification(memberIds, {
                groupId: meeting.groupId,
                meetingId: meeting.meetingId,
                title: `Meeting Finalized: ${meeting.title}`,
                body: `The details for "${meeting.title}" have been finalized.`
            });
        }

        const members = await prisma.groupMember.findMany({
                where: { groupId: meeting.groupId, status: "ACCEPTED"}
            });

            const memberIds = members.map(member => member.memberId);

        if (status === "CANCELLED" && existing.status !== "CANCELLED") {
            try {
                await sendCancellationNoticeForMeeting(meeting.meetingId);
            } catch (err) {
                console.log(`Failed to send cancellation notice for meeting ${meeting.meetingId}:`, err);
            }

            await createInAppNotification(memberIds, {
                groupId: meeting.groupId,
                meetingId: meeting.meetingId,
                title: `Meeting Cancelled: ${meeting.title}`,
                body: `The meeting "${meeting.title}" has been cancelled.`
            });

        }

        res.status(200).json({ meeting });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errorMessage: "Unable to update meeting status." });
    }
};

export const getMeetingNotifications = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const notification = await prisma.notifications.findMany({
            where: { meetingId: parseInt(meetingId) },
            include: { user: true }
        });

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get meeting notifications." });
    }
};

// Attendance

export const getMeetingAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const attendance =  await prisma.attendance.findMany({
            where: { meetingId: parseInt(meetingId) },
            include: { member: true }
        });

        res.status(200).json({ attendance });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get Meeting Attendance" });
    }
};

export const confirmAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status } = req.body;
        const memberId = parseInt(req.user.userId);

        if (!["CONFIRMED", "DECLINED"].includes(status)) {
            return res.status(400).json({ errorMessage: "Invalid status." });
        }

        const attendance = await prisma.attendance.upsert({
            where: {
                meetingId_memberId: {
                    meetingId: parseInt(meetingId),
                    memberId,
                },
            },
            update: { status, respondedAt: new Date() },
            create: {
                meetingId: parseInt(meetingId),
                memberId,
                status,
                respondedAt: new Date(),
            },
        });

        res.status(200).json({ attendance });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to update attendance." });
    }
};