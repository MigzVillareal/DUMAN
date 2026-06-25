import { useState } from "react";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import {
  DASHBOARD_USER,
  UPCOMING_MEETINGS,
  PENDING_INVITATIONS,
  getDashboardStats,
} from "../data/dashboardMock.js";

const ChevronIcon = ({ up }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

function formatWelcomeDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function MeetingCard({ meeting }) {
  const [expanded, setExpanded] = useState(meeting.defaultExpanded);

  return (
    <article className="auth-card dashboard-meeting-card">
      <div className="dashboard-meeting-card__header">
        <div className="dashboard-meeting-card__info">
          <h3 className="dashboard-meeting-card__title">
            {meeting.group} — {meeting.title}
          </h3>
          <p className="dashboard-meeting-card__meta">{meeting.location}</p>
          <p className="dashboard-meeting-card__meta">{meeting.schedule}</p>
        </div>
        <div className="dashboard-meeting-card__actions">
          <button type="button" className="btn-primary dashboard-btn-pill dashboard-btn-pill--soft">
            View Location
          </button>
          <button
            type="button"
            className="dashboard-meeting-card__toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse meeting details" : "Expand meeting details"}
          >
            <ChevronIcon up={expanded} />
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

function Dashboard() {
  const [meetings] = useState(UPCOMING_MEETINGS);
  const [invitations, setInvitations] = useState(PENDING_INVITATIONS);

  const { meetingsToday, pendingInvitations } = getDashboardStats(meetings, invitations);

  const handleDeclineInvite = (id) => {
    setInvitations((prev) => prev.filter((invite) => invite.id !== id));
  };

  const handleAcceptInvite = (id) => {
    setInvitations((prev) => prev.filter((invite) => invite.id !== id));
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <h1 className="dashboard-welcome__title">
          Welcome Back, {DASHBOARD_USER.firstName}!
        </h1>
        <p className="dashboard-welcome__subtitle">
          {formatWelcomeDate()} — {DASHBOARD_USER.university}
        </p>
        <p className="dashboard-welcome__summary">
          You have{" "}
          <span className="dashboard-welcome__highlight dashboard-welcome__highlight--primary">
            {meetingsToday} meeting{meetingsToday !== 1 ? "s" : ""}
          </span>{" "}
          scheduled for today and{" "}
          <span className="dashboard-welcome__highlight dashboard-welcome__highlight--accent">
            {pendingInvitations} pending invitation{pendingInvitations !== 1 ? "s" : ""}
          </span>{" "}
          awaiting your review.
        </p>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2 className="dashboard-panel__title">All Upcoming Meetings</h2>
          <div className="dashboard-panel__list">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel--side">
          <h2 className="dashboard-panel__title">Pending Invitations</h2>
          {invitations.length === 0 ? (
            <p className="dashboard-invite-card__meta">No pending invitations.</p>
          ) : (
            invitations.map((invite) => (
            <article key={invite.id} className="auth-card dashboard-invite-card">
              <h3 className="dashboard-invite-card__title">{invite.group}</h3>
              <p className="dashboard-invite-card__meta">Invited by: {invite.invitedBy}</p>
              <p className="dashboard-invite-card__meta">Role: {invite.role}</p>
              <div className="dashboard-invite-card__actions">
                <button
                  type="button"
                  className="btn-primary dashboard-btn-pill dashboard-btn-pill--soft"
                  onClick={() => handleAcceptInvite(invite.id)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn-primary dashboard-btn-pill dashboard-btn-pill--outline"
                  onClick={() => handleDeclineInvite(invite.id)}
                >
                  Decline
                </button>
              </div>
            </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
