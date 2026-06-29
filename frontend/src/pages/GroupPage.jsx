import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useGroups } from "../context/GroupsContext.jsx";
import { getGroupDetails } from "../data/groupsMock.js";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { isToday } from "../utils/date.js";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import "../css/pages/GroupPage.css";

function GroupMeetingCard({ meeting }) {
  const [expanded, setExpanded] = useState(meeting.defaultExpanded);

  return (
    <article
      className={`auth-card dashboard-meeting-card${isToday(meeting.date) ? " meeting-card--today" : ""}`}
    >
      <div className="dashboard-meeting-card__header">
        <div className="dashboard-meeting-card__info">
          <h3 className="dashboard-meeting-card__title">{meeting.title}</h3>
          <p className="dashboard-meeting-card__meta">{meeting.location}</p>
          <p className="dashboard-meeting-card__meta">{meeting.schedule}</p>
        </div>
        <div className="dashboard-meeting-card__actions">
          <button type="button" className="btn-primary group-page__btn-pill group-page__btn-pill--soft">
            View Location
          </button>
          <button
            type="button"
            className="dashboard-meeting-card__toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse meeting details" : "Expand meeting details"}
          >
            <Icon icon="chevron-down" size="sm" expanded={expanded} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="dashboard-meeting-card__body">
          <p className="dashboard-meeting-card__label">Meeting Description:</p>
          <p className="dashboard-meeting-card__text">{meeting.description}</p>
          <p className="dashboard-meeting-card__label">Agenda</p>
          <ul className="dashboard-meeting-card__agenda">
            {meeting.agenda.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function GroupPage() {
  const { groupId } = useParams();
  const { groups } = useGroups();
  const group = groups.find((g) => g.id === groupId);

  if (!group) return <Navigate to="/groups" replace />;

  const { meetings, members } = getGroupDetails(groupId);

  return (
    <div className="group-page">
      <PageHeader
        title={group.name}
        subtitle={group.description || undefined}
        action={
          <button
            type="button"
            className="btn-primary group-page__btn-pill group-page__btn-pill--soft"
          >
            Schedule
          </button>
        }
      />

      <div className="group-page__grid">
        <section className="dashboard-panel">
          <h2 className="dashboard-panel__title">Upcoming Group Meetings</h2>
          <div className="dashboard-panel__list">
            {meetings.length === 0 ? (
              <p className="group-page__empty">No upcoming meetings scheduled.</p>
            ) : (
              meetings.map((meeting) => (
                <GroupMeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        </section>

        <section className="dashboard-panel group-page__members-panel">
          <h2 className="dashboard-panel__title">Members</h2>
          <ul className="group-page__members-list">
            {members.map((member) => (
              <li key={member.id} className="group-page__member">
                <span className="group-page__member-name">{member.name}</span>
              </li>
            ))}
          </ul>
          <div className="group-page__members-footer">
            <button type="button" className="group-page__invite-btn">
              + Invite
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
