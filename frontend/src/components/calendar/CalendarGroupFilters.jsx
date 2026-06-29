function CalendarGroupFilters({ groups, activeFilter, onChange }) {
  return (
    <nav className="calendar-filters" aria-label="Group filters">
      <button
        type="button"
        className={`calendar-filter-tab${activeFilter === "all" ? " calendar-filter-tab--active" : ""}`}
        onClick={() => onChange("all")}
      >
        All Groups
      </button>
      {groups.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`calendar-filter-tab${activeFilter === group.id ? " calendar-filter-tab--active" : ""}`}
          onClick={() => onChange(group.id)}
        >
          {group.name}
        </button>
      ))}
    </nav>
  );
}

export default CalendarGroupFilters;
