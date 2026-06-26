import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";

// Group CRUD

export const createGroup = async (req, res) => {
    try {
        const { name, description, groupColor, userId } = req.body;

        const group = await prisma.group.create({
            data: {
                name, 
                description, 
                groupColor, 
                userId
            },
        })

        res.status(201).json({ group });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get user." });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const { userId } = req.query;

        const groups = await prisma.group.findMany({
            where: userId ? { userId: parseInt(userId) } : undefined,
            include: {
                members: true,
                meetings: true,
            },
        });

        res.status(200).json({ groups });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get groups."})
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await prisma.group.findUnique({
            where: { groupId: parseInt(groupId) },
            include: {
                members: true,
                meetings: true,
                notifications: true,
            },
        });

        if (!group) {
            return res.status(404).json({ errorMessage: "Group not found. " });
        }
        
        res.status(200).json({ group });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get group." });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, groupColor } = req.body;

        const group = await prisma.group.update({
            where: { groupId: parseInt(groupId) },
            data: {
                name,
                description,
                groupColor,
            },
        });

        res.status(200).json({ group });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to update group."});
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params
        
        await prisma.group.delete({
            where: { groupId: parseInt(groupId) },
        });

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to delete group. "});
    }
};

// Member Management

export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, role } = req.body;

        const member = await prisma.groupMember.create({ 
            data: {
                groupId: parseInt(groupId),
                userId,
                role,
            },
        });

        req.status(201).json({ member });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to add member." });
    }
};

export const getAllMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const members = await prisma.groupMember.findMany({
            where: { groupId: parseInt(groupId) },
            include: { user: true },
        });

        res.status(200).json({ members });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get members" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        
        await prisma.groupMember.delete({
            where: {
                groupId_userId: {
                    groupId: parseInt(groupId),
                    userId: parseInt(userId),
                },
            },
        });
        
        res.status(200).json({ message: "Member removed successfully." });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to remove member." });
    }
};

// Invite System

export const sendInvite = async (req, res) => {
    try { 
        const { groupId } = req.params;
        const { userId, InvitedBy } = req.body;

        const existing = await prisma.groupMember.findUnique({
            where: {
                memberId_groupId: {
                    memberId: userId,
                    groupId: parseInt(groupId)
                }
            }
        });

        if (exisitng) {
            res.status(400).json({ errorMessage: "User already invited or is a member of the group." });
        }

        const member = await prisma.groupMember.create({
            data: {
                memberId: userId,
                groupId: parseInt(groupId),
                invitiedBy,
                status: "PENDING"
            }
        });

        res.status(201).json({ member });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to send invites." });
    }
};

export const getGroupInvites = async (req, res) => {
    try {
        const { groupId } = req.params;

        const invites = await prisma.groupMember.findMany({
            where: {
                groupId: parseInt(groupid),
                staus: "PENDING"
            },
            include: {
                user: true,
                inviter: true,
            }
        });

        res.status(200).json({ invites })
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get group invites." });
    }
};

// Related-Data Operations

export const getGroupMeetings = async (req, res) => {
    try {
        const { groupId } = req.params;

        const meetings = await prisma.meeting.findMany({
            where: { groupId: parseInt(groupId) },
        });

        res.status(200).json({ meetings });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get group meetings." });
    }
};

export const getGroupNotifications = async (req, res) => {
    try {
        const { groupId } =  req.params;

        const notifications = await prisma.notification.findMany({
            where: { groupId: parseInt(groupId) },
        });
        
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to get group notifications." });
    }
};

export const acceptInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        const member = await prisma.groupMember.update({
            where: {
                memberId_groupId: {
                    memberId: parseInt(memberId),
                    groupId: parseInt(groupId)
                }
            },
            data: {
                status: "ACCEPTED",
                joinedAt: new Date()
            }
        });

        res.status(200).json({ member });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to accecpt invite." });
    }
};

export const declineInvite = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        await prisma.groupMember.delete({
            where: {
                memberId_groupId: {
                    memberId: parseInt(userId),
                    groupId: parseInt(groupId)
                }
            }
        });

        res.status(200).json({ message: "Invite declined." });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to decline invite." });
    }
};

