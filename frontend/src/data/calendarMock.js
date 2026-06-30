/**
 * Calendar events derived from meetingsMock.js (single source of truth).
 * Replace fetch path with GET /api/v1/users/:userId/meetings?from=&to=&groupId=
 */

import { MEETINGS_LIST } from "./meetingsMock.js";

/** @typedef {'UPCOMING' | 'ONGOING' | 'FINISHED' | 'VOTING'} MeetingStatus */
/** @typedef {'PENDING' | 'ATTENDING' | 'DECLINED'} RsvpStatus */

/**
 * @typedef {Object} CalendarGroup
 * @property {number} groupId
 * @property {string} name
 * @property {string} slug
 */

/**
 * @typedef {Object} CalendarEvent
 * @property {number} meetingId
 * @property {string} title
 * @property {string|null} description
 * @property {MeetingStatus} status
 * @property {string|null} locationDetail
 * @property {string} schedule ISO-8601 DateTime
 * @property {string|null} endsAt ISO-8601 DateTime
 * @property {string} scheduleLabel Display label from meetings mock
 * @property {number} setterId
 * @property {number} intendedGroupId
 * @property {CalendarGroup} intendedGroup
 * @property {{ status: RsvpStatus }} rsvp
 * @property {string[]} [agenda]
 * @property {boolean} [finalized]
 * @property {Array<{ id: string, label: string, votes: number, total: number }>} [proposedTimes]
 */

/** @type {Record<string, CalendarGroup>} */
const GROUP_BY_NAME = {
  Research: {
    groupId: 1,
    name: "Research",
    slug: "research",
  },
  Volunteer: {
    groupId: 2,
    name: "Volunteer",
    slug: "volunteer",
  },
  "Study Group": {
    groupId: 3,
    name: "Study Group",
    slug: "study-group",
  },
};

/** @type {Record<string, MeetingStatus>} */
const STATUS_FROM_MEETINGS = {
  upcoming: "UPCOMING",
  voting: "VOTING",
  past: "FINISHED",
};

/** UTC times aligned with meetingsMock schedule labels (UTC+8 display). */
const MEETING_TIME_SLOTS = {
  1: { startH: 6, startM: 0, endH: 7, endM: 30 },
  2: { startH: 8, startM: 0, endH: 9, endM: 30 },
  3: { startH: 2, startM: 0, endH: 3, endM: 0 },
  4: { startH: 5, startM: 0, endH: 6, endM: 30 },
  5: { startH: 9, startM: 0, endH: 10, endM: 30 },
};

function padTime(value) {
  return String(value).padStart(2, "0");
}

function buildISO(date, hour, minute) {
  return `${date}T${padTime(hour)}:${padTime(minute)}:00.000Z`;
}

/**
 * @param {import('./meetingsMock.js').MEETINGS_LIST[number]} meeting
 * @returns {CalendarEvent}
 */
export function meetingToCalendarEvent(meeting) {
  const group = GROUP_BY_NAME[meeting.group];
  const slot = MEETING_TIME_SLOTS[meeting.id] ?? {
    startH: 12,
    startM: 0,
    endH: 13,
    endM: 0,
  };

  return {
    meetingId: meeting.id,
    title: meeting.title,
    description: meeting.description ?? null,
    status: STATUS_FROM_MEETINGS[meeting.status] ?? "UPCOMING",
    locationDetail: meeting.location,
    schedule: buildISO(meeting.date, slot.startH, slot.startM),
    endsAt: buildISO(meeting.date, slot.endH, slot.endM),
    scheduleLabel: meeting.schedule,
    setterId: 1,
    intendedGroupId: group.groupId,
    intendedGroup: group,
    rsvp: { status: "PENDING" },
    agenda: meeting.agenda ?? [],
    finalized: meeting.finalized ?? true,
    ...(meeting.proposedTimes ? { proposedTimes: meeting.proposedTimes } : {}),
  };
}

/** @type {CalendarEvent[]} */
export const CALENDAR_MOCK_EVENTS = MEETINGS_LIST.map(meetingToCalendarEvent);
