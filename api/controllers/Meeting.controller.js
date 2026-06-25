import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";
import { dmmfToRuntimeDataModel } from '../prisma/generated/runtime/client';

// Meeting CRUD

export const createMeeting = async (req, res) => {
    try {
        const { title, description, locationDetail, schedule, endsAt, intendedGroup } = req.body;

        const meeting = await prisma.meeting.create({
            data: {
                title,
                description,
                locationDetail,
                schedule,
                endsAt,
                intendedGroup
            }
        });
        
        res.status(201).json({ neeting });
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
        res.status(500).json({ errorMessage: "" });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const meeting = await.prisma.findUnique({
            where: { meetingId: parseInt(meeting)}
        })

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
                schedule,
                endsAt
            }
        })

        res.status(200).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to update meeting." });
    }
};