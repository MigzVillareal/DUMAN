import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGroups } from "../context/GroupsContext.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";
import Icon from "./Icon.jsx";
import "../css/global/sidebar.css";

export default function GroupsSidebar() {
  const [query, setQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const { groups, addGroup, loading } = useGroups();
  const navigate = useNavigate();

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreateGroup = async ({ name, description, members }) => {
    setCreating(true);
    setCreateError("");

    try {
      const newGroup = await addGroup({ name, description, members });
      setShowCreateModal(false);
      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      setCreateError(
        err.message || "Unable to create group. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateError("");
    setShowCreateModal(true);
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
        {loading ? (
          <li className="groups-sidebar__status">Loading groups...</li>
        ) : filtered.length === 0 ? (
          <li className="groups-sidebar__status">No groups yet.</li>
        ) : (
          filtered.map((group) => (
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
          ))
        )}
      </ul>

      <div className="groups-sidebar__footer">
        <button
          type="button"
          className="groups-sidebar__create-btn"
          onClick={handleOpenCreateModal}
        >
          <Icon icon="plus" size="sm" />
          Create New Group
        </button>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => {
            if (!creating) setShowCreateModal(false);
          }}
          onSubmit={handleCreateGroup}
          submitting={creating}
          submitError={createError}
        />
      )}
    </aside>
  );
}
