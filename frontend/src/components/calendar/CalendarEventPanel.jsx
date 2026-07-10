import { Link } from "react-router-dom";
import { formatEventTime, formatLongDate } from "../../utils/calendar.js";
import "../../css/pages/Meetings.css";

function getEventStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "calendar-event-card--pending";
    case "CANCELLED":
      return "calendar-event-card--cancelled";
    case "FINISHED":
    case "VOTING":
      return "calendar-event-card--muted";
    default:
      return "calendar-event-card--upcoming";
  }
}

function CalendarEventCard({ event, onRsvp, isUpdating }) {
  const rsvpStatus = event.rsvp?.status ?? "PENDING";
  const isFinalized = event.status !== "PENDING";
  const schedule =
    event.scheduleLabel ?? formatEventTime(event.schedule, event.endsAt);

  return (
    <article
      className={`calendar-event-card ${getEventStatusClass(event.status)}`}
    >
      <div className="calendar-event-card__info">
        <p className="meetings-list-item__name">
          {event.group?.name ?? "—"} &mdash; {event.title}
        </p>
        <p className="meetings-list-item__meta">
          {event.locationDetail ?? "—"}
        </p>
        <p className="meetings-list-item__meta">{schedule}</p>
      </div>

      <div className="calendar-event-card__footer">
        <Link
          to="/meetings"
          className="calendar-event-card__details-btn"
          state={{ meetingId: event.meetingId }}
        >
          View Details
        </Link>

        {rsvpStatus === "ATTENDING" && (
          <p className="calendar-rsvp-status calendar-rsvp-status--confirmed">
            Confirmed
          </p>
        )}

        {rsvpStatus === "DECLINED" && (
          <p className="calendar-rsvp-status calendar-rsvp-status--declined">
            Declined
          </p>
        )}

        {!isFinalized && rsvpStatus === "PENDING" && (
          <div className="calendar-event-card__actions">
            <button
              type="button"
              className={`calendar-rsvp-btn calendar-rsvp-btn--attending${isUpdating ? " calendar-rsvp-btn--loading" : ""}`}
              onClick={() => onRsvp(event.meetingId, "ATTENDING")}
            >
              {isUpdating ? "Saving..." : "Attending"}
            </button>
            <button
              type="button"
              className={`calendar-rsvp-btn calendar-rsvp-btn--decline${isUpdating ? " calendar-rsvp-btn--loading" : ""}`}
              onClick={() => onRsvp(event.meetingId, "DECLINED")}
            >
              {isUpdating ? "Saving..." : "Decline"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function CalendarEventPanel({ selectedDate, events, onRsvp, updatingMeetingId }) {
  if (!selectedDate) {
    return (
      <aside className="calendar-event-panel calendar-event-panel--empty">
        <p className="calendar-event-panel__placeholder">
          Select a date to view events.
        </p>
      </aside>
    );
  }

  const eventLabel = events.length === 1 ? "1 event" : `${events.length} events`;

  return (
    <aside className="calendar-event-panel" aria-label="Event details">
      <header className="calendar-event-panel__header">
        <h2 className="calendar-event-panel__date">{formatLongDate(selectedDate)}</h2>
        <p className="calendar-event-panel__count">{eventLabel}</p>
      </header>

      <div className="calendar-event-panel__list">
        {events.length === 0 ? (
          <p className="calendar-event-panel__empty">No events on this day.</p>
        ) : (
          events.map((event) => (
            <CalendarEventCard
              key={event.meetingId}
              event={event}
              onRsvp={onRsvp}
              isUpdating={
                updatingMeetingId != null &&
                Number(updatingMeetingId) === Number(event.meetingId)
              }
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default CalendarEventPanel;
