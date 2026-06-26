import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGroups } from "../context/GroupsContext.jsx";
import Icon from "./Icon.jsx";
import "../css/global/sidebar.css";

export default function GroupsSidebar() {
  const [query, setQuery] = useState("");
  const { groups, addGroup } = useGroups();
  const navigate = useNavigate();

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreateGroup = () => {
    const name = window.prompt("Enter a name for your new group:");
    if (!name?.trim()) return;
    const newGroup = addGroup(name);
    navigate(`/groups/${newGroup.id}`);
  };

  return (
    <aside className="groups-sidebar">
      <NavLink
        to="/groups"
        end
        className={({ isActive }) =>
          `groups-sidebar__title${isActive ? " groups-sidebar__title--active" : ""}`
        }
      >
        My Groups
      </NavLink>

      <div className="groups-sidebar__search-wrapper">
        <span className="groups-sidebar__search-icon">
          <Icon icon="search" size="sm" />
        </span>
        <input
          className="groups-sidebar__search"
          type="text"
          placeholder="Search groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="groups-sidebar__list">
        {filtered.map((group) => (
          <li key={group.id}>
            <NavLink
              to={`/groups/${group.id}`}
              className={({ isActive }) =>
                `groups-sidebar__item${isActive ? " groups-sidebar__item--active" : ""}`
              }
            >
              {group.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="groups-sidebar__footer">
        <button
          type="button"
          className="groups-sidebar__create-btn"
          onClick={handleCreateGroup}
        >
          <Icon icon="plus" size="sm" />
          Create New Group
        </button>
      </div>
    </aside>
  );
}
