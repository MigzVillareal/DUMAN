import { PrismaClient } from '../prisma/generated/index.js';
import bcrypt from "bcrypt"
import prisma from "../lib/prisma.js";

export const registerUser = async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body; 

        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ errorMessage: "All fields are required." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                password: hashedPassword,
            },
        })

        res.status(201).json({ message: 'User created successfully', userId: user.userId });
    } catch (error) {
        console.error(error);

        if (error.code = 'P2002') {
            return res.status(409).json({ errorMessage: "Username or email already exists" });
        }

        res.status(500).json({ errorMessage:"Unable to create user." })
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ errorMessage: "User not found." });

        const isMatch =await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ errorMessage: "Invalid credentials." });

        res.status(200).json({ message: "Logged in successfully." });
    } catch (error) {
        res.status(500).json({ errorMessage: "Unable to login." });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        res.status(500).json({ message: "Unable to logout." })
    }
};