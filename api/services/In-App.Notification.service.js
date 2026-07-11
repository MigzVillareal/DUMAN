import prisma from "../lib/prisma.js";

export const createInAppNotification = async (userIds, { groupId, meetingId = null, title, body } = {}) => {
    const notifications = userIds.map(userId => ({
        userId,
        groupId,
        meetingId,
        title,
        body,
        isRead: false
    }));

    return await prisma.notification.createMany({ data: notifications });
};