import {
  formatMonthYear,
  getDayEventBars,
  getEventsForDate,
  getMonthGrid,
} from "../../utils/calendar.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_BARS = 3;

function CalendarMonthView({
  year,
  month,
  events,
  selectedDate,
  todayDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) {
  const cells = getMonthGrid(year, month);

  return (
    <div className="calendar-month">
      <div className="calendar-month__header">
        <button
          type="button"
          className="calendar-month__nav"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="calendar-month__header-center">
          <h2 className="calendar-month__title">{formatMonthYear(year, month)}</h2>
          <button
            type="button"
            className="calendar-month__today-btn"
            onClick={onGoToToday}
          >
            Today
          </button>
        </div>
        <button
          type="button"
          className="calendar-month__nav"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-month__weekdays" aria-hidden="true">
        {WEEKDAYS.map((label) => (
          <span key={label} className="calendar-month__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-month__grid" role="grid" aria-label={formatMonthYear(year, month)}>
        {cells.map((cell, index) => {
          if (!cell) {
            return (
              <div
                key={`empty-${index}`}
                className="calendar-day calendar-day--empty"
                role="gridcell"
                aria-hidden="true"
              />
            );
          }

          const bars = getDayEventBars(events, cell.date);
          const visibleBars = bars.slice(0, MAX_VISIBLE_BARS);
          const hiddenBarCount = bars.length - visibleBars.length;
          const dayEvents = getEventsForDate(events, cell.date);
          const isSelected = selectedDate === cell.date;
          const isToday = todayDate === cell.date;
          const ariaLabel =
            dayEvents.length === 0
              ? cell.date
              : `${cell.date}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`;

          return (
            <button
              key={cell.date}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={ariaLabel}
              className={`calendar-day${isSelected ? " calendar-day--selected" : ""}${isToday ? " calendar-day--today" : ""}${bars.length > 0 ? " calendar-day--has-events" : ""}`}
              onClick={() => onSelectDate(cell.date)}
            >
              <span className="calendar-day__number">{cell.day}</span>
              {visibleBars.length > 0 && (
                <div className="calendar-day__bars">
                  {visibleBars.map((bar) => (
                    <span
                      key={bar.meetingId}
                      className={`calendar-day__bar${
                        bar.cancelled ? " calendar-day__bar--cancelled" : ""
                      }${bar.muted ? " calendar-day__bar--muted" : ""}${
                        bar.pending ? " calendar-day__bar--pending" : ""
                      }`}
                    />
                  ))}
                  {hiddenBarCount > 0 && (
                    <span className="calendar-day__bar-overflow">
                      +{hiddenBarCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarMonthView;
