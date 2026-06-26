export const INITIAL_GROUPS = [
  {
    id: "research",
    name: "Research",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "volunteer",
    name: "Volunteer",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "study-group",
    name: "Study Group",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export function slugifyGroupName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const GROUP_DETAILS = {
  research: {
    meetings: [
      {
        id: 1,
        title: "Thesis Progress Review",
        location: "Alingal Building, AL212",
        schedule: "Today, 2:00 PM – 3:30 PM",
        date: new Date().toISOString().slice(0, 10),
        description: LOREM,
        agenda: [
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
        ],
        defaultExpanded: true,
      },
      {
        id: 2,
        title: "Literature Review",
        location: "Library, 3rd Floor",
        schedule: "Friday, 1:00 PM – 2:30 PM",
        date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        description: LOREM,
        agenda: ["Lorem ipsum dolor sit amet"],
        defaultExpanded: false,
      },
    ],
    members: [
      { id: 1, name: "Juan Cruz" },
      { id: 2, name: "Victor Magtanggol" },
      { id: 3, name: "Maria Hiwaga" },
    ],
  },
  volunteer: {
    meetings: [
      {
        id: 1,
        title: "Community Outreach Planning",
        location: "Covered Court",
        schedule: "Friday, 10:00 AM – 11:00 AM",
        date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        description: LOREM,
        agenda: [
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
        ],
        defaultExpanded: true,
      },
      {
        id: 2,
        title: "Pre-Event Briefing",
        location: "Student Lounge",
        schedule: "Saturday, 8:00 AM – 9:00 AM",
        date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
        description: LOREM,
        agenda: ["Lorem ipsum dolor sit amet"],
        defaultExpanded: false,
      },
    ],
    members: [
      { id: 1, name: "Juan Cruz" },
      { id: 2, name: "Maria Hiwaga" },
      { id: 3, name: "Miggy Villareal" },
    ],
  },
  "study-group": {
    meetings: [
      {
        id: 1,
        title: "Ethics In Information Technology Review Session",
        location: "Bonoan Building, 2nd Floor",
        schedule: "Tomorrow, 4:00 PM – 5:30 PM",
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        description: LOREM,
        agenda: [
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
        ],
        defaultExpanded: true,
      },
      {
        id: 2,
        title: "Midterm Prep Session",
        location: "Bonoan Building, Room 204",
        schedule: "Next Monday, 5:00 PM – 6:30 PM",
        date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
        description: LOREM,
        agenda: ["Lorem ipsum dolor sit amet"],
        defaultExpanded: false,
      },
    ],
    members: [
      { id: 1, name: "Juan Cruz" },
      { id: 2, name: "Jian Joshua Cleofe" },
      { id: 3, name: "Ivan Zabala" },
    ],
  },
};

const DEFAULT_GROUP_DETAILS = {
  meetings: [],
  members: [{ id: 1, name: "Juan Cruz" }],
};

export function getGroupDetails(groupId) {
  return GROUP_DETAILS[groupId] ?? DEFAULT_GROUP_DETAILS;
}
