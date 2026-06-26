import { isToday } from "../utils/date.js";

export const DASHBOARD_USER = {
  firstName: "Miggy",
  university: "Ateneo de Naga University",
};

export const UPCOMING_MEETINGS = [
  {
    id: 1,
    group: "Research",
    title: "Thesis Progress Review",
    location: "Alingal Building, AL212",
    schedule: "Today, 2:00 PM – 3:30 PM",
    date: new Date().toISOString().slice(0, 10),
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    agenda: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    mapUrl: "/campus-map?room=ric-204",
    defaultExpanded: true,
  },
  {
    id: 2,
    group: "Study Group",
    title: "Ethics In Information Technology Review Session",
    location: "Bonoan Building, 2nd Floor",
    schedule: "Tomorrow, 4:00 PM – 5:30 PM",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    agenda: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    mapUrl: "/campus-map?room=plt-3f",
    defaultExpanded: false,
  },
  {
    id: 3,
    group: "Volunteer",
    title: "Community Outreach Planning",
    location: "Covered Court",
    schedule: "Friday, 10:00 AM – 11:00 AM",
    date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    agenda: [
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet",
    ],
    mapUrl: "/campus-map?room=student-lounge",
    defaultExpanded: false,
  },
];

export const PENDING_INVITATIONS = [
  {
    id: 1,
    group: "Programming Club",
    invitedBy: "Ivan Zabala",
    role: "Member",
    sentAt: "2 hours ago",
  },
  {
    id: 2,
    group: "KurtSan",
    invitedBy: "Niku Gaza",
    role: "Leader",
    sentAt: "Yesterday",
  },
];

export function getDashboardStats(meetings, invitations) {
  return {
    meetingsToday: meetings.filter((m) => isToday(m.date)).length,
    pendingInvitations: invitations.length,
  };
}
