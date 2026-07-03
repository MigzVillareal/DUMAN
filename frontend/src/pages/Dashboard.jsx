import { useCallback, useEffect, useState } from "react";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useGroups } from "../context/GroupsContext.jsx";
import {
  acceptGroupInvite,
  declineGroupInvite,
  fetchGroupById,
  fetchUserInvites,
} from "../services/groupService.js";
import { isToday } from "../utils/date.js";
import { mapApiInvite } from "../utils/groups.js";

const UNIVERSITY_NAME = "Ateneo de Naga University";

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
    <article
      className={`auth-card dashboard-meeting-card${isToday(meeting.date) ? " meeting-card--today" : ""}`}
    >
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

function Dashboard() {
  const { user } = useAuth();
  const { loadGroups, mergeGroup } = useGroups();
  const [meetings] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [actioningInviteId, setActioningInviteId] = useState(null);

  const firstName = user?.firstname ?? "blank";
  const meetingsToday = meetings.filter((m) => isToday(m.date)).length;
  const pendingInvitations = invitations.length;

  const loadInvites = useCallback(async () => {
    if (!user?.userId) {
      setInvitations([]);
      setInvitesLoading(false);
      return;
    }

    setInvitesLoading(true);
    setInviteError("");

    try {
      const data = await fetchUserInvites(user.userId);

      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }

      setInvitations((data.invites ?? []).map(mapApiInvite));
    } catch (err) {
      setInviteError(err.message || "Unable to load invitations.");
      setInvitations([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleDeclineInvite = async (invite) => {
    setActioningInviteId(invite.id);
    setInviteError("");

    try {
      const data = await declineGroupInvite(invite.groupId);

      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }

      setInvitations((prev) => prev.filter((entry) => entry.id !== invite.id));
    } catch (err) {
      setInviteError(err.message || "Unable to decline invitation.");
    } finally {
      setActioningInviteId(null);
    }
  };

  const handleAcceptInvite = async (invite) => {
    setActioningInviteId(invite.id);
    setInviteError("");

    try {
      const data = await acceptGroupInvite(invite.groupId);

      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }

      setInvitations((prev) => prev.filter((entry) => entry.id !== invite.id));

      const groupData = await fetchGroupById(invite.groupId);
      if (groupData.group) {
        mergeGroup(groupData.group);
      }

      await loadGroups();
    } catch (err) {
      setInviteError(err.message || "Unable to accept invitation.");
    } finally {
      setActioningInviteId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome Back, ${firstName}!`}
        subtitle={`${formatWelcomeDate()} — ${UNIVERSITY_NAME}`}
      >
        <p className="page-header__summary">
          You have{" "}
          <span className="page-header__highlight page-header__highlight--primary">
            {meetingsToday} meeting{meetingsToday !== 1 ? "s" : ""}
          </span>{" "}
          scheduled for today and{" "}
          <span className="page-header__highlight page-header__highlight--accent">
            {pendingInvitations} pending invitation{pendingInvitations !== 1 ? "s" : ""}
          </span>{" "}
          awaiting your review.
        </p>
      </PageHeader>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2 className="dashboard-panel__title">All Upcoming Meetings</h2>
          <div className="dashboard-panel__list">
            {meetings.length === 0 ? (
              <p className="dashboard-invite-card__meta">No upcoming meetings.</p>
            ) : (
              meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel--side">
          <h2 className="dashboard-panel__title">Pending Invitations</h2>
          {inviteError && (
            <p className="dashboard-invite-card__meta dashboard-invite-card__error" role="alert">
              {inviteError}
            </p>
          )}
          {invitesLoading ? (
            <p className="dashboard-invite-card__meta">Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p className="dashboard-invite-card__meta">No pending invitations.</p>
          ) : (
            <div className="dashboard-panel__list">
              {invitations.map((invite) => (
                <article key={invite.id} className="auth-card dashboard-invite-card">
                  <h3 className="dashboard-invite-card__title">{invite.group}</h3>
                  <p className="dashboard-invite-card__meta">Invited by: {invite.invitedBy}</p>
                  <p className="dashboard-invite-card__meta">Role: {invite.role}</p>
                  <div className="dashboard-invite-card__actions">
                    <button
                      type="button"
                      className="btn-primary dashboard-btn-pill dashboard-btn-pill--soft"
                      onClick={() => handleAcceptInvite(invite)}
                      disabled={actioningInviteId === invite.id}
                    >
                      {actioningInviteId === invite.id ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="btn-primary dashboard-btn-pill dashboard-btn-pill--outline"
                      onClick={() => handleDeclineInvite(invite)}
                      disabled={actioningInviteId === invite.id}
                    >
                      {actioningInviteId === invite.id ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
