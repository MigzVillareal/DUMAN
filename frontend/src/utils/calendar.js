/**
 * @param {number} year
 * @param {number} month 0-indexed
 */
export function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * @param {number} year
 * @param {number} month 0-indexed
 * @returns {{ from: string, to: string }}
 */
export function getMonthRange(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    from: toISODate(year, month, 1),
    to: toISODate(year, month, lastDay),
  };
}

/**
 * @param {number} year
 * @param {number} month 0-indexed
 * @returns {Array<{ date: string, day: number } | null>}
 */
export function getMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: toISODate(year, month, day), day });
  }

  return cells;
}

/** @param {string} isoDate YYYY-MM-DD */
export function formatLongDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** @param {number} year @param {number} month 0-indexed */
export function formatMonthYear(year, month) {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** @param {string} isoDateTime */
export function formatEventTime(isoDateTime, endsAt) {
  const start = new Date(isoDateTime);
  const timeOpts = { hour: "numeric", minute: "2-digit" };

  if (!endsAt) {
    return start.toLocaleTimeString("en-US", timeOpts);
  }

  const end = new Date(endsAt);
  return `${start.toLocaleTimeString("en-US", timeOpts)} – ${end.toLocaleTimeString("en-US", timeOpts)}`;
}

/** @param {string} schedule ISO DateTime */
export function getDateKey(schedule) {
  return schedule.slice(0, 10);
}

const MUTED_BAR_COLOR = "#c8c8c8";
const EVENT_BAR_COLOR = "#273c8d";

/**
 * @param {import('../data/calendarMock.js').CalendarEvent[]} events
 * @param {string} dateKey YYYY-MM-DD
 */
export function getEventsForDate(events, dateKey) {
  return events
    .filter((event) => getDateKey(event.schedule) === dateKey)
    .sort(
      (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
    );
}

/**
 * @param {import('../data/calendarMock.js').CalendarEvent[]} events
 * @param {string} dateKey
 * @returns {Array<{ meetingId: number, color: string, muted: boolean }>}
 */
export function getDayEventBars(events, dateKey) {
  return getEventsForDate(events, dateKey).map((event) => {
    const muted =
      event.status === "VOTING" || event.status === "FINISHED";

    return {
      meetingId: event.meetingId,
      color: muted ? MUTED_BAR_COLOR : EVENT_BAR_COLOR,
      muted,
    };
  });
}

/** @param {string|null|undefined} groupFilter */
export function resolveGroupFilterId(groupFilter) {
  if (!groupFilter || groupFilter === "all") return null;
  return groupFilter;
}
