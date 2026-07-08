import { CALENDAR_MOCK_EVENTS } from "../data/calendarMock.js";
import { getDateKey } from "../utils/calendar.js";
import { USE_MOCK_CALENDAR } from "../data/mock.js";
import { getAuthHeaders } from "../utils/authStorage.js";
import { normalizeMeetingForCalendar } from "./meetingService.js";

export { normalizeMeetingForCalendar };

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
  if (USE_MOCK_CALENDAR) {
    return {
      events: filterMockEvents({ from, to, groupFilter }),
    };
  }

  if (!userId) {
    throw new Error("Unable to load calendar events.");
  }

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (groupFilter && groupFilter !== "all") {
    params.set("groupId", groupFilter);
  }

  const response = await fetch(
    `/api/v1/users/${userId}/meetings?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  const data = await response.json();

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to load calendar events.");
  }

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
  if (USE_MOCK_CALENDAR) {
    return { meetingId, status };
  }

  const response = await fetch(`/api/v1/meetings/${meetingId}/rsvp`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to update RSVP.");
  }

  return data;
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
        event.group.slug === groupFilter ||
        String(event.groupId) === groupFilter
    );
  }

  return events.sort(
    (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
  );
}
