import { getAuthHeaders } from "../utils/authStorage.js";

export const NOTIFICATION_TYPES = {
  invite: "You are invited to a meeting",
  created: "A new meeting was created",
  finalized: "Meeting has been finalized",
  updated: "Meeting details were updated",
  cancelled: "Meeting was cancelled",
  reminder: "Upcoming meeting reminder",
  member_added: "You were added to a group",
  rsvp: "A member responded to a meeting",
};

export function getNotificationDestination(notification) {
  if (notification.type === "member_added" && notification.groupId) {
    return { path: `/groups/${notification.groupId}`, label: "Go to Group" };
  }

  if (notification.meetingId) {
    return {
      path: "/meetings",
      state: { meetingId: notification.meetingId },
      label: "Go to Meeting",
    };
  }

  if (notification.groupId) {
    return { path: `/groups/${notification.groupId}`, label: "Go to Group" };
  }

  return { path: "/meetings", label: "Go to Meetings" };
}

async function parseJson(response) {
  return response.json();
}

function inferNotificationType(title = "") {
  const normalized = title.toLowerCase();

  if (normalized.includes("group invite")) return "member_added";
  if (normalized.includes("new meeting")) return "created";
  if (normalized.includes("meeting update")) return "updated";
  if (normalized.includes("meeting finalized")) return "finalized";
  if (normalized.includes("meeting cancelled")) return "cancelled";
  if (normalized.includes("reminder")) return "reminder";

  return "created";
}

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function mapNotification(notification) {
  return {
    id: notification.notificationId,
    type: inferNotificationType(notification.title),
    read: notification.isRead,
    groupId: notification.groupId,
    groupName: notification.group?.name ?? "Group",
    meetingId: notification.meetingId ?? null,
    meetingTitle: notification.meeting?.title ?? null,
    title: notification.title,
    body: notification.body,
    timeAgo: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt,
  };
}

export async function fetchUserNotifications(userId) {
  const response = await fetch(`/api/v1/users/${userId}/notifications`, {
    headers: getAuthHeaders(),
  });
  const data = await parseJson(response);

  if (data.errorMessage) {
    throw new Error(data.errorMessage);
  }

  return (data.notifications ?? []).map(mapNotification);
}

export async function markNotificationRead(notificationId) {
  const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await parseJson(response);

  if (data.errorMessage) {
    throw new Error(data.errorMessage);
  }

  return data.notification ? mapNotification(data.notification) : null;
}
