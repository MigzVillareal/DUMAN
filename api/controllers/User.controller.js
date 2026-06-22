import { PrismaClient } from '../prisma/generated/index.js';
import prisma from "../lib/prisma.js";

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
        const { id } = req.params;
        
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return res.status(404).json({ errorMessage: "User not found." });

        res.status(200).json(user);
    } catch (error) {
        res.stattus(500).json({ errorMessage: "Unable to get user." });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, username, email } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstname,
                lastname,
                username,
                email,
            },
        });

        res.status(200).json({ message: "User updated successfully.", user });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to update user." });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({ where: { id: parseInt(id) } });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to delete user." });
    }
};