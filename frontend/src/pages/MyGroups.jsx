import { Link } from "react-router-dom";
import { useGroups } from "../context/GroupsContext.jsx";
import "../css/pages/MyGroups.css";

export default function MyGroups() {
  const { groups } = useGroups();

  return (
    <div className="my-groups-page">
      <header className="my-groups-page__header">
        <h1 className="my-groups-page__title">My Groups</h1>
        <p className="my-groups-page__subtitle">
          Select a group from the sidebar or create a new one to get started.
        </p>
      </header>

      {groups.length > 0 && (
        <ul className="my-groups-page__list">
          {groups.map((group) => (
            <li key={group.id}>
              <Link to={`/groups/${group.id}`} className="my-groups-page__card">
                <span className="my-groups-page__card-name">{group.name}</span>
                {group.description && (
                  <span className="my-groups-page__card-desc">{group.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
