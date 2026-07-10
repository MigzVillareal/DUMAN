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

export function formatMeetingLocation({ building, floor, roomNumber }) {
  if (!building) return "";

  if (floor && roomNumber) {
    return `${building} · Floor ${floor} · ${roomNumber}`;
  }

  if (floor) {
    return `${building} · Floor ${floor}`;
  }

  if (roomNumber) {
    return `${building} · ${roomNumber}`;
  }

  return building;
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

export function mapMeetingUiStatus(status) {
  switch (status) {
    case "PENDING":
      return "pending";
    case "UPCOMING":
    case "ONGOING":
      return "upcoming";
    case "FINISHED":
      return "past";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}

export function isPastMeetingStatus(status) {
  return status === "FINISHED";
}

export function isUpcomingMeetingStatus(status) {
  return status === "UPCOMING" || status === "ONGOING";
}

export function isCancelledMeetingStatus(status) {
  return status === "CANCELLED";
}

export function buildCreateMeetingPayload(form) {
  const location = campusLocations.find((item) => item.id === form.locationId);

  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    groupId: Number(form.group),
    building: location?.building ?? "",
    floor:
      location && locationHasRoomSelection(location) ? form.floor || null : null,
    roomNumber:
      location && locationHasRoomSelection(location)
        ? form.room.trim() || null
        : null,
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
    finalized: meeting.status !== "PENDING",
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

export async function updateMeeting(meetingId, { title, description }) {
  const response = await fetch(`/api/v1/meetings/${meetingId}`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      title: title.trim(),
      description: description?.trim() || null,
    }),
  });

  const data = await parseJson(response);

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to update meeting.");
  }

  return data;
}

export async function deleteMeeting(meetingId) {
  const response = await fetch(`/api/v1/meetings/${meetingId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok || data.errorMessage) {
    throw new Error(data.errorMessage ?? "Unable to delete meeting.");
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
