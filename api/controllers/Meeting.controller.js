import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
// import { dmmfToRuntimeDataModel } from '../prisma/generated/runtime/client';
// import { sendNotificationEmail } from '../services/email.service.js';

// Meeting CRUD

export const createMeeting = async (req, res) => {
    try {
        const { title, description, building, roomNumber, schedule, endsAt, intendedGroupId } = req.body;

        const meeting = await prisma.meeting.create({
            data: {
                title,
                description,
                building,
                roomNumber,
                schedule: new Date(schedule),
                endsAt: endsAt ? new Date(endAt) : null,
                intendedGroupId
            }
        });

        const members = await prisma.groupMember.findMany({
            where: { 
                groupId: intendedGroupId,
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

        const { format } = require('date-fns');
        const schedule = format(new Date(meetingDate), 'EEEE, MMMM do, yyyy hh:mm a');
        
        for (const member of members) {
            const info = await transporter.sendMail({
                from: '"DUMAN" <duman.masaen@gmail.com>',
                bcc: `duman.masaen@gmail.com, ${process.env.DEVS_MAIL}, ${member.memberId}`,
                subject: `Upcoming Meeting: ${title}`,
                text: `A meeting has been scheduled for ${schedule}.`,
            });
        }
        
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
                intendedGroup: true,
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
        const { title, description, locationDetail, schedule, endsAt } = req.body;

        const meeting = await prisma.meeting.update({
            where: { meetingid: parseInt(meetingId) },
            data: {
                title,
                description,
                locationDetail,
                ...(schedule && { schedule: new Data(schedule) }),
                ...(endsAt && { endsAt: new Data(endsAt) }),
            },
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

        const meeting = await prisma.meeting.update({
            wjere: { meetingId: parseInt(meetingId) },
            data: { status }
        });

        res.status(200).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get meeting status." });
    }
};

export const getMeetingNotifications = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const notification = await prisma.notifications.findMany({
            where: { meetingId: parseInt(meetingId) },
            include: {user: true }
        });

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get meeting notifications." });
    }
};