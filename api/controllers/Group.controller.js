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
        const { userId, role} = req.body;
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

// Related-Data

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