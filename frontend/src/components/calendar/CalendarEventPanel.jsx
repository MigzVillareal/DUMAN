import { Link } from "react-router-dom";
import { formatEventTime, formatLongDate } from "../../utils/calendar.js";

function CalendarEventCard({ event, onRsvp, isUpdating }) {
  const { status: rsvpStatus } = event.rsvp;

  return (
    <article className="calendar-event-card">
      <div className="calendar-event-card__header">
        <h3 className="calendar-event-card__title">{event.title}</h3>
        <Link
          to="/meetings"
          className="calendar-event-card__details-btn"
          state={{ meetingId: event.meetingId }}
        >
          View Details
        </Link>
      </div>

      <dl className="calendar-event-card__meta">
        <div className="calendar-event-card__row">
          <dt>Group Name</dt>
          <dd>{event.intendedGroup.name}</dd>
        </div>
        <div className="calendar-event-card__row">
          <dt>Time</dt>
          <dd>
            {event.scheduleLabel ??
              formatEventTime(event.schedule, event.endsAt)}
          </dd>
        </div>
        <div className="calendar-event-card__row">
          <dt>Location</dt>
          <dd>{event.locationDetail ?? "—"}</dd>
        </div>
      </dl>

      <div className="calendar-event-card__actions">
        <button
          type="button"
          className={`calendar-rsvp-btn calendar-rsvp-btn--attending${rsvpStatus === "ATTENDING" ? " calendar-rsvp-btn--active" : ""}`}
          disabled={isUpdating}
          onClick={() => onRsvp(event.meetingId, "ATTENDING")}
        >
          Attending
        </button>
        <button
          type="button"
          className={`calendar-rsvp-btn calendar-rsvp-btn--decline${rsvpStatus === "DECLINED" ? " calendar-rsvp-btn--active" : ""}`}
          disabled={isUpdating}
          onClick={() => onRsvp(event.meetingId, "DECLINED")}
        >
          Decline
        </button>
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
              isUpdating={updatingMeetingId === event.meetingId}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default CalendarEventPanel;
