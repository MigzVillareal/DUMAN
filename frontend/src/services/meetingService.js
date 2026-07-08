import { getAuthHeaders } from "../utils/authStorage.js";
import {
  campusLocations,
  locationHasRoomSelection,
} from "../data/campusLocations.js";

async function parseJson(response) {
  return response.json();
}

function combineDateAndTime(date, time) {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`).toISOString();
}

export function formatMeetingLocation({ building, roomNumber }) {
  if (!building) return "";

  const location = campusLocations.find((item) => item.building === building);

  if (!location || !roomNumber || !locationHasRoomSelection(location)) {
    return building;
  }

  const floor = Object.entries(location.roomsByFloor).find(([, rooms]) =>
    rooms.includes(roomNumber)
  )?.[0];

  return floor
    ? `${building} · Floor ${floor} · ${roomNumber}`
    : `${building} · ${roomNumber}`;
}

export function formatMeetingSchedule(schedule, endsAt) {
  const start = new Date(schedule);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(start);
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const startTime = timeFmt.format(start);

  if (!endsAt) {
    return `${dateLabel}, ${startTime}`;
  }

  return `${dateLabel}, ${startTime} – ${timeFmt.format(new Date(endsAt))}`;
}

function mapMeetingUiStatus(status) {
  if (status === "FINISHED") return "past";
  return "upcoming";
}

export function buildCreateMeetingPayload(form) {
  const location = campusLocations.find((item) => item.id === form.locationId);

  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    groupId: Number(form.group),
    building: location?.building ?? "",
    roomNumber:
      location && locationHasRoomSelection(location) ? form.room || null : null,
    schedule: combineDateAndTime(form.date, form.start),
    endsAt: combineDateAndTime(form.date, form.end),
  };
}

export function normalizeMeetingForCalendar(meeting, rsvp = null) {
  const group = meeting.group;

  return {
    meetingId: meeting.meetingId,
    title: meeting.title,
    description: meeting.description ?? null,
    status: meeting.status,
    locationDetail: formatMeetingLocation(meeting),
    schedule: meeting.schedule,
    endsAt: meeting.endsAt ?? null,
    setterId: meeting.setterId ?? null,
    groupId: meeting.groupId ?? group?.groupId,
    group: group
      ? {
          groupId: group.groupId,
          name: group.name,
        }
      : null,
    rsvp: { status: rsvp?.status ?? "PENDING" },
  };
}

export function mapMeetingForMeetingsList(meeting) {
  return {
    id: meeting.meetingId,
    group: meeting.group?.name ?? "",
    title: meeting.title,
    location: formatMeetingLocation(meeting),
    schedule: formatMeetingSchedule(meeting.schedule, meeting.endsAt),
    date: new Date(meeting.schedule).toISOString().slice(0, 10),
    status: mapMeetingUiStatus(meeting.status),
    finalized: meeting.status !== "FINISHED",
    description: meeting.description ?? "",
    attending: [],
    notAttending: [],
  };
}

export function mapMeetingForGroupPage(meeting, index = 0) {
  return {
    id: meeting.meetingId,
    title: meeting.title,
    location: formatMeetingLocation(meeting),
    schedule: formatMeetingSchedule(meeting.schedule, meeting.endsAt),
    date: new Date(meeting.schedule).toISOString().slice(0, 10),
    description: meeting.description ?? "",
    defaultExpanded: index === 0,
  };
}

export async function createMeeting(form) {
  const response = await fetch("/api/v1/meetings", {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(buildCreateMeetingPayload(form)),
  });

  const data = await parseJson(response);

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to create meeting.");
  }

  return data;
}

export async function fetchUserMeetings(userId, { from, to, groupId } = {}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (groupId) params.set("groupId", groupId);

  const query = params.toString();
  const response = await fetch(
    `/api/v1/users/${userId}/meetings${query ? `?${query}` : ""}`,
    { headers: getAuthHeaders() }
  );

  const data = await parseJson(response);

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to load meetings.");
  }

  return data;
}

export async function fetchGroupMeetings(groupId) {
  const response = await fetch(`/api/v1/groups/${groupId}/meetings`, {
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to load group meetings.");
  }

  return data;
}
