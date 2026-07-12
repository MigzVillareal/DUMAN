import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";
import supabase from "../lib/supabase.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get users." });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await prisma.user.findUnique({ where: { userId: parseInt(userId) } });
        if (!user) return res.status(404).json({ errorMessage: "User not found." });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get user." });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstname, lastname, username, email } = req.body;

        const user = await prisma.user.update({
            where: { userId: parseInt(userId) },
            data: {
                firstname,
                lastname,
                username,
                email,
            },
        });

        res.status(200).json({ message: "User updated successfully.", user });
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ errorMessage: "Unable to update user." });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await prisma.user.delete({ where: { userId: parseInt(userId) } });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to delete user." });
    }
};

// User Invite Operations

export const getUserInvites = async (req, res) => {
    try {
        const { userId } = req.params;

        const invites = await prisma.groupMember.findMany({
            where : {
                memberId: parseInt(userId),
                status: "PENDING"
            },
            include: {
                group: true,
                inviter: true
            }
        });

        res.status(200).json({ invites });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get invites." });
    }
};

export const getUserMeetings = async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = await prisma.meeting.findMany({
            where: {
                group: {
                    members: {
                        some: {
                            memberId: parseInt(userId),
                            status: "ACCEPTED"
                        }
                    }
                }
            },
            orderBy: { schedule: "asc"},
            include: {
                group: true,
                notifications: true,
                attendance: {
                    where: { memberId: parseInt(userId) },
                },
            },
        });

        res.status(200).json({ meetings });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get user meetings." });
    }
};

export const getUserMeeting = async (req, res) => {
    try {
        const { userId, meetingId } = req.params;

        const meeting = await prisma.meeting.findUnique({
            where: { meetingId: parseInt(meetingId) },
            include: {
                group: true,
            },
        });

        if (!meeting) {
            return res.status(404).json({ errorMessage: "Meeting not found." });
        }

        const isMember = await prisma.groupMember.findUnique({
            where: {
                memberId_groupId: {
                    memberId: parseInt(userId),
                    groupId: meeting.groupId,
                }
            }
        });

        if (!isMember || isMember.status !== "ACCEPTED") {
            return res.status(403).json({ errorMessage: "User is not a member of this group." });
        }

        res.status(200).json({ meeting });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get user meeting." });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await prisma.notification.findMany({
            where: {
                userId: parseInt(userId),
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                group: true,
                meeting: true,
            },
        });

        res.status(200).json({ notifications });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errorMessage: "Unable to get notifications."
        });
    }
};