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

export const NOTIFICATIONS_LIST = [
  {
    id: 1,
    type: "invite",
    read: false,
    groupId: "research",
    groupName: "Research",
    meetingId: 1,
    meetingTitle: "Thesis Progress Review",
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    type: "created",
    read: false,
    groupId: "study-group",
    groupName: "Study Group",
    meetingId: 2,
    meetingTitle: "Ethics In IT Review Session",
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    type: "finalized",
    read: false,
    groupId: "volunteer",
    groupName: "Volunteer",
    meetingId: 3,
    meetingTitle: "Community Outreach Planning",
    timeAgo: "Yesterday",
  },
  {
    id: 4,
    type: "reminder",
    read: true,
    groupId: "research",
    groupName: "Research",
    meetingId: 1,
    meetingTitle: "Thesis Progress Review",
    timeAgo: "2 days ago",
  },
  {
    id: 5,
    type: "updated",
    read: true,
    groupId: "study-group",
    groupName: "Study Group",
    meetingId: 2,
    meetingTitle: "Ethics In IT Review Session",
    timeAgo: "3 days ago",
  },
  {
    id: 6,
    type: "member_added",
    read: true,
    groupId: "volunteer",
    groupName: "Volunteer",
    meetingId: null,
    meetingTitle: null,
    timeAgo: "4 days ago",
  },
  {
    id: 7,
    type: "rsvp",
    read: true,
    groupId: "research",
    groupName: "Research",
    meetingId: 1,
    meetingTitle: "Thesis Progress Review",
    timeAgo: "5 days ago",
  },
  {
    id: 8,
    type: "cancelled",
    read: true,
    groupId: "study-group",
    groupName: "Study Group",
    meetingId: 4,
    meetingTitle: "Midterm Review Session",
    timeAgo: "1 week ago",
  },
];
