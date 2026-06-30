import { CALENDAR_MOCK_EVENTS } from "../data/calendarMock.js";
import { getDateKey } from "../utils/calendar.js";

const USE_MOCK = true;

/**
 * Maps a Prisma Meeting (with includes) to the calendar event shape.
 * Use when wiring the real API.
 *
 * @param {object} meeting
 * @param {{ status?: string }|null} [rsvp]
 */
export function normalizeMeetingForCalendar(meeting, rsvp = null) {
  return {
    meetingId: meeting.meetingId,
    title: meeting.title,
    description: meeting.description ?? null,
    status: meeting.status,
    locationDetail: meeting.locationDetail ?? null,
    schedule: meeting.schedule,
    endsAt: meeting.endsAt ?? null,
    setterId: meeting.setterId,
    intendedGroupId: meeting.intendedGroupId,
    intendedGroup: {
      groupId: meeting.intendedGroup.groupId,
      name: meeting.intendedGroup.name,
    },
    rsvp: { status: rsvp?.status ?? "PENDING" },
  };
}

/**
 * @param {object} params
 * @param {number} [params.userId]
 * @param {string} [params.from] YYYY-MM-DD
 * @param {string} [params.to] YYYY-MM-DD
 * @param {string|null} [params.groupFilter] group slug or "all"
 * @returns {Promise<{ events: import('../data/calendarMock.js').CalendarEvent[] }>}
 */
export async function fetchCalendarEvents({
  userId,
  from,
  to,
  groupFilter = "all",
} = {}) {
  if (USE_MOCK) {
    return {
      events: filterMockEvents({ from, to, groupFilter }),
    };
  }

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (groupFilter && groupFilter !== "all") {
    params.set("groupId", groupFilter);
  }

  const response = await fetch(
    `/api/v1/users/${userId}/meetings?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Unable to load calendar events.");
  }

  const data = await response.json();
  return {
    events: (data.meetings ?? []).map((meeting) =>
      normalizeMeetingForCalendar(meeting, meeting.myRsvp)
    ),
  };
}

/**
 * @param {number} meetingId
 * @param {'ATTENDING'|'DECLINED'|'PENDING'} status
 * @returns {Promise<{ meetingId: number, status: string }>}
 */
export async function updateMeetingRsvp(meetingId, status) {
  if (USE_MOCK) {
    return { meetingId, status };
  }

  const response = await fetch(`/api/v1/meetings/${meetingId}/rsvp`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Unable to update RSVP.");
  }

  return response.json();
}

function filterMockEvents({ from, to, groupFilter }) {
  let events = [...CALENDAR_MOCK_EVENTS];

  if (from && to) {
    events = events.filter((event) => {
      const date = getDateKey(event.schedule);
      return date >= from && date <= to;
    });
  }

  if (groupFilter && groupFilter !== "all") {
    events = events.filter(
      (event) =>
        event.intendedGroup.slug === groupFilter ||
        String(event.intendedGroupId) === groupFilter
    );
  }

  return events.sort(
    (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
  );
}
