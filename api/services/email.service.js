import nodemailer from "nodemailer";
import prisma from "..lib/prisma.js"

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

export const sendNotificationEmail = async (notificationId) => {
    const notification = await prisma.notification.findUnique({
        where: { notificationId },
        include: { user: true },
    });

    try {
        await transporter.sendMail({
            from:process.env.MAIL_FROM,
            to: notification.user.email,
            subject:notification.subject,
            html: notification.body,
        });

        await prisma.notification.update({
            where: { notificationId },
            data: {status: "SENT" }
        });

    } catch (error) {
        await prisma.notification.update({
            where: { notificationId },
            data: { status: "FAILED" }
        });

        throw error;
    }
};