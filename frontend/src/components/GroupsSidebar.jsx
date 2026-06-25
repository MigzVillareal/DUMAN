import { useState } from "react";
import "../css/sidebar.css";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* Placeholder groups — replace with real data when backend is connected */
const SAMPLE_GROUPS = ["Research", "Volunteer", "Study Group"];

export default function GroupsSidebar() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  const filtered = SAMPLE_GROUPS.filter((g) =>
    g.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="groups-sidebar">
      {/* Title */}
      <h2 className="groups-sidebar__title">My Groups</h2>

      {/* Search */}
      <div className="groups-sidebar__search-wrapper">
        <span className="groups-sidebar__search-icon">
          <SearchIcon />
        </span>
        <input
          className="groups-sidebar__search"
          type="text"
          placeholder="Search groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Group List */}
      <ul className="groups-sidebar__list">
        {filtered.map((group) => (
          <li key={group}>
            <button
              className={`groups-sidebar__item${activeGroup === group ? " groups-sidebar__item--active" : ""}`}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          </li>
        ))}
      </ul>

      {/* Create New Group */}
      <div className="groups-sidebar__footer">
        <button className="groups-sidebar__create-btn">
          <PlusIcon />
          Create New Group
        </button>
      </div>
    </aside>
  );
}
