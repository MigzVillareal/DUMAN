// ── Meetings Mock Data ──────────────────────────────────────────────

export const MEETINGS_LIST = [
  {
    id: 1,
    group: "Research",
    title: "Thesis Progress Review",
    location: "Alingal Building, AL212",
    schedule: "Today, 2:00 PM – 3:30 PM",
    date: new Date().toISOString().slice(0, 10),
    status: "upcoming",
    finalized: true,
    description:
      "Review progress on individual thesis chapters and align on next steps.",
    agenda: [
      "Chapter status updates",
      "Adviser feedback discussion",
      "Timeline adjustment",
    ],
  },
  {
    id: 2,
    group: "Study Group",
    title: "Ethics In IT Review Session",
    location: "Bonoan Building, 2nd Floor",
    schedule: "Tomorrow, 4:00 PM – 5:30 PM",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: "upcoming",
    finalized: true,
    description:
      "Collaborative review session for the upcoming Ethics in IT midterm exam.",
    agenda: [
      "Review key concepts",
      "Past exam walkthroughs",
      "Q&A session",
    ],
  },
  {
    id: 3,
    group: "Volunteer",
    title: "Community Outreach Planning",
    location: "Covered Court",
    schedule: "Friday, 10:00 AM – 11:00 AM",
    date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status: "voting",
    finalized: false,
    description:
      "Plan logistics and volunteer assignments for the upcoming outreach event.",
    agenda: [
      "Assign team roles",
      "Material preparation",
      "Transport coordination",
    ],
    proposedTimes: [
      { id: "t1", label: "Friday, 10:00 AM – 11:00 AM", votes: 5, total: 5 },
      { id: "t2", label: "Saturday, 2:00 PM – 3:00 PM", votes: 3, total: 5 },
      { id: "t3", label: "Sunday, 9:00 AM – 10:00 AM", votes: 2, total: 5 },
    ],
  },
  {
    id: 4,
    group: "Research",
    title: "Literature Review",
    location: "Library, 3rd Floor",
    schedule: "Last Friday, 1:00 PM – 2:30 PM",
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    status: "past",
    finalized: true,
    description:
      "Reviewed and compiled relevant literature for the research background section.",
    agenda: [
      "Source evaluation",
      "Annotation review",
      "Bibliography compilation",
    ],
  },
  {
    id: 5,
    group: "Study Group",
    title: "Midterm Prep Session",
    location: "Bonoan Building, Room 204",
    schedule: "Last Monday, 5:00 PM – 6:30 PM",
    date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    status: "past",
    finalized: true,
    description: "Intensive preparation for the midterm examinations.",
    agenda: [
      "Practice problems",
      "Concept clarification",
      "Group Q&A",
    ],
  },
];

// Unfinalized (voting) meetings that appear in the "Finalize Meeting" modal
export const UNFINALIZED_MEETINGS = MEETINGS_LIST.filter((m) => !m.finalized);
