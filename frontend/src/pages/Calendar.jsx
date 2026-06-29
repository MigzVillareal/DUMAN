import { useCallback, useEffect, useMemo, useState } from "react";
import "../css/pages/Login.css";
import "../css/pages/Calendar.css";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import CalendarGroupFilters from "../components/calendar/CalendarGroupFilters.jsx";
import CalendarMonthView from "../components/calendar/CalendarMonthView.jsx";
import CalendarEventPanel from "../components/calendar/CalendarEventPanel.jsx";
import { useGroups } from "../context/GroupsContext.jsx";
import {
  fetchCalendarEvents,
  updateMeetingRsvp,
} from "../services/calendarService.js";
import {
  getEventsForDate,
  getMonthRange,
  toISODate,
} from "../utils/calendar.js";

const today = new Date();

function Calendar() {
  const { groups } = useGroups();
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    toISODate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingMeetingId, setUpdatingMeetingId] = useState(null);

  const monthRange = useMemo(
    () => getMonthRange(visibleYear, visibleMonth),
    [visibleYear, visibleMonth]
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { events: nextEvents } = await fetchCalendarEvents({
        from: monthRange.from,
        to: monthRange.to,
        groupFilter,
      });
      setEvents(nextEvents);
    } catch (err) {
      setError(err.message ?? "Unable to load calendar.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [monthRange.from, monthRange.to, groupFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const selectedDayEvents = useMemo(
    () => (selectedDate ? getEventsForDate(events, selectedDate) : []),
    [events, selectedDate]
  );

  const handlePrevMonth = () => {
    if (visibleMonth === 0) {
      setVisibleYear((y) => y - 1);
      setVisibleMonth(11);
      return;
    }
    setVisibleMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleYear((y) => y + 1);
      setVisibleMonth(0);
      return;
    }
    setVisibleMonth((m) => m + 1);
  };

  const handleRsvp = async (meetingId, status) => {
    setUpdatingMeetingId(meetingId);

    try {
      await updateMeetingRsvp(meetingId, status);
      setEvents((prev) =>
        prev.map((event) =>
          event.meetingId === meetingId
            ? { ...event, rsvp: { status } }
            : event
        )
      );
    } catch (err) {
      setError(err.message ?? "Unable to update RSVP.");
    } finally {
      setUpdatingMeetingId(null);
    }
  };

  return (
    <div className="calendar-page">
      <PageHeader
        title="Shared Calendar"
        subtitle="View and vote on group availability"
        action={
          <button
            type="button"
            className="calendar-btn calendar-btn--primary"
            onClick={() => {}}
          >
            <Icon icon="plus" size="sm" />
            Propose Schedule
          </button>
        }
      />

      <CalendarGroupFilters
        groups={groups}
        activeFilter={groupFilter}
        onChange={setGroupFilter}
      />

      {error && (
        <p className="calendar-page__error" role="alert">
          {error}
        </p>
      )}

      <div className="calendar-content">
        <section className="calendar-panel" aria-label="Calendar">
          {loading ? (
            <p className="calendar-panel__loading">Loading calendar…</p>
          ) : (
            <CalendarMonthView
              year={visibleYear}
              month={visibleMonth}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          )}
        </section>

        <CalendarEventPanel
          selectedDate={selectedDate}
          events={selectedDayEvents}
          onRsvp={handleRsvp}
          updatingMeetingId={updatingMeetingId}
        />
      </div>
    </div>
  );
}

export default Calendar;
