import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";
import { dmmfToRuntimeDataModel } from '../prisma/generated/runtime/client';
import { sendNotificationEmail } from '../services/email.service.js';

// Meeting CRUD

export const createMeeting = async (req, res) => {
    try {
        const { title, description, locationDetail, schedule, endsAt, intendedGroupId } = req.body;

        const meeting = await prisma.meeting.create({
            data: {
                title,
                description,
                locationDetail,
                schedule: new Date(schedule),
                endsAt: endAt ? new Date(endAt) : null,
                intendedGroupId
            }
        });

        const notification = await prisma.notification.create({ 
            data: {
                subject,
                body
            }
         });

        await sendNotificationEmail(notification.notificationId);
        
        res.status(201).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to create meeting." });
    }
};

export const getAllMeetingsByUserId = async (req, res) => {
    try {
        const { groupId, setterId, memberId, status } = req.query;

        const meetings = await prisma.meeting.findMany({
            where: {
                ...(groupId && { intendedGroupId: parseInt(groupId) }),
                ...(setterId && { setterId: parseInt(setterId) }),
                ...(status && { status }),
                ...(memberId && {
                    intendedGroup: {
                        members: {
                            some: {
                                memberId: parseInt(memberId)
                            }
                        }
                    }
                })
            },
            orderBy: { schedule: "asc"},
            include: {
                setter: true,
                intendedGroup: true,
                notifications: true,
            },
        });

        res.status(200).json({ meetings });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get meetings." });
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