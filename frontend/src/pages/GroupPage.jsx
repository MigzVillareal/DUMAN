import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useGroups } from "../context/GroupsContext.jsx";
import { getGroupDetails } from "../data/groupsMock.js";
import {
  fetchGroupMembers,
  removeGroupMember,
  sendGroupInvite,
  USE_MOCK_GROUPS,
} from "../services/groupService.js";
import {
  createMeeting,
  fetchGroupMeetings,
  mapMeetingForGroupPage,
} from "../services/meetingService.js";
import {
  canRemoveGroupMember,
  ensureOwnerAsLeader,
  mapApiMember,
} from "../utils/groups.js";
import Icon from "../components/Icon.jsx";
import InviteMembersModal from "../components/InviteMembersModal.jsx";
import CreateMeetingModal from "../components/CreateMeetingModal.jsx";
import RemoveMemberModal from "../components/RemoveMemberModal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { isToday } from "../utils/date.js";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import "../css/pages/GroupPage.css";
import "../css/pages/Meetings.css";

const MEETING_FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

function getDisplayedGroupMeetings(meetings, filter, isMock) {
  if (isMock) {
    const today = new Date().toISOString().slice(0, 10);

    return meetings
      .filter((meeting) =>
        filter === "past" ? meeting.date < today : meeting.date >= today
      )
      .sort((a, b) => {
        const diff = a.date.localeCompare(b.date);
        return filter === "past" ? -diff : diff;
      })
      .map((meeting, index) => ({
        ...meeting,
        defaultExpanded: index === 0,
      }));
  }

  return (meetings ?? [])
    .filter((meeting) =>
      filter === "past"
        ? meeting.status === "FINISHED"
        : meeting.status !== "FINISHED"
    )
    .sort((a, b) => {
      const diff =
        new Date(a.schedule).getTime() - new Date(b.schedule).getTime();
      return filter === "past" ? -diff : diff;
    })
    .map((meeting, index) => mapMeetingForGroupPage(meeting, index));
}

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
        </div>
      )}
    </article>
  );
}

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { groups, loading, setGroupMembers } = useGroups();
  const group = groups.find((g) => g.id === groupId);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);
  const [meetingFilter, setMeetingFilter] = useState("upcoming");
  const [meetingsLoading, setMeetingsLoading] = useState(!USE_MOCK_GROUPS);

  const displayedMeetings = useMemo(
    () => getDisplayedGroupMeetings(allMeetings, meetingFilter, USE_MOCK_GROUPS),
    [allMeetings, meetingFilter]
  );

  const mockDetails = getGroupDetails(groupId);

  useEffect(() => {
    if (!group) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    if (USE_MOCK_GROUPS) {
      const fallbackMembers = mockDetails.members ?? [];
      if (group.members != null) {
        setMembers(group.members);
      } else {
        setMembers(fallbackMembers);
      }
      setMembersLoading(false);
      return;
    }

    if (group.groupId == null) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    let cancelled = false;
    const apiGroupId = group.groupId;
    const ownerId = group.userId;

    async function loadMembers() {
      setMembersLoading(true);

      try {
        const data = await fetchGroupMembers(apiGroupId);

        if (cancelled) return;

        if (data.errorMessage) {
          setMembers([]);
          return;
        }

        const mapped = (data.members ?? []).map((record) =>
          mapApiMember(record, ownerId)
        );

        setMembers(ensureOwnerAsLeader(mapped, user, ownerId));
      } catch {
        if (!cancelled) {
          setMembers([]);
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [group?.id, group?.groupId, group?.userId, groupId, user?.userId]);

  useEffect(() => {
    if (!group) {
      setAllMeetings([]);
      setMeetingsLoading(false);
      return;
    }

    if (USE_MOCK_GROUPS) {
      setAllMeetings(mockDetails.meetings ?? []);
      setMeetingsLoading(false);
      return;
    }

    if (group.groupId == null) {
      setAllMeetings([]);
      setMeetingsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMeetings() {
      setMeetingsLoading(true);

      try {
        const data = await fetchGroupMeetings(group.groupId);

        if (cancelled) return;

        if (data.errorMessage) {
          setAllMeetings([]);
          return;
        }

        setAllMeetings(data.meetings ?? []);
      } catch {
        if (!cancelled) {
          setAllMeetings([]);
        }
      } finally {
        if (!cancelled) {
          setMeetingsLoading(false);
        }
      }
    }

    loadMeetings();

    return () => {
      cancelled = true;
    };
  }, [group?.groupId, groupId, mockDetails.meetings]);

  if (loading) {
    return (
      <div className="group-page">
        <p className="group-page__empty">Loading group...</p>
      </div>
    );
  }

  if (!group) return <Navigate to="/groups" replace />;

  const handleRemoveMember = async (member) => {
    const allowed =
      USE_MOCK_GROUPS && group.userId == null
        ? member.role !== "leader"
        : canRemoveGroupMember(user, group, member, members);

    if (!allowed) return;

    setRemovingMemberId(member.id);
    setRemoveError("");

    try {
      if (!USE_MOCK_GROUPS) {
        if (group.groupId == null) {
          throw new Error("Group is missing an id.");
        }

        const data = await removeGroupMember(group.groupId, member.id);

        if (data.errorMessage) {
          throw new Error(data.errorMessage);
        }

        const membersData = await fetchGroupMembers(group.groupId);

        if (membersData.errorMessage) {
          throw new Error(membersData.errorMessage);
        }

        const mapped = (membersData.members ?? []).map((record) =>
          mapApiMember(record, group.userId)
        );
        const nextMembers = ensureOwnerAsLeader(mapped, user, group.userId);
        setMembers(nextMembers);
        setGroupMembers(groupId, nextMembers);
      } else {
        const nextMembers = members.filter((entry) => entry.id !== member.id);
        setMembers(nextMembers);
        setGroupMembers(groupId, nextMembers);
      }

      setMemberToRemove(null);
    } catch (err) {
      setRemoveError(err.message || "Unable to remove member.");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      handleRemoveMember(memberToRemove);
    }
  };

  const handleSendInvites = async (invitedMembers) => {
    setInviting(true);
    setInviteError("");

    try {
      if (USE_MOCK_GROUPS) {
        setMembers((prev) => {
          const existingIds = new Set(prev.map((member) => member.id));
          const newMembers = invitedMembers
            .filter((member) => !existingIds.has(member.id))
            .map((member) => ({ ...member, role: "member" }));

          const nextMembers = [...prev, ...newMembers];
          setGroupMembers(groupId, nextMembers);
          return nextMembers;
        });
        setShowInviteModal(false);
        return;
      }

      for (const member of invitedMembers) {
        const data = await sendGroupInvite(group.groupId, {
          email: member.email,
        });

        if (data.errorMessage) {
          throw new Error(data.errorMessage);
        }
      }

      const membersData = await fetchGroupMembers(group.groupId);

      if (membersData.errorMessage) {
        throw new Error(membersData.errorMessage);
      }

      const mapped = (membersData.members ?? []).map((record) =>
        mapApiMember(record, group.userId)
      );
      const nextMembers = ensureOwnerAsLeader(mapped, user, group.userId);
      setMembers(nextMembers);
      setGroupMembers(groupId, nextMembers);
      setShowInviteModal(false);
    } catch (err) {
      setInviteError(err.message || "Unable to send invites.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="group-page">
      <PageHeader
        title={group.name}
        subtitle={group.description || undefined}
        action={
          <button
            type="button"
            className="page-action-btn page-action-btn--primary"
            onClick={() => setShowCreateMeetingModal(true)}
          >
            <Icon icon="plus" size="sm" />
            Create Meeting
          </button>
        }
      />

      <div className="group-page__grid">
        <section className="dashboard-panel">
          <div className="group-page__meetings-header">
            <h2 className="dashboard-panel__title">
              {meetingFilter === "past" ? "Past Group Meetings" : "Upcoming Group Meetings"}
            </h2>
            <nav className="meetings-filters" aria-label="Meeting filters">
              {MEETING_FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`meetings-filter-tab${meetingFilter === item.key ? " meetings-filter-tab--active" : ""}`}
                  onClick={() => setMeetingFilter(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="dashboard-panel__list">
            {meetingsLoading ? (
              <p className="group-page__empty">Loading meetings...</p>
            ) : displayedMeetings.length === 0 ? (
              <p className="group-page__empty">
                {meetingFilter === "past"
                  ? "No past meetings."
                  : "No upcoming meetings scheduled."}
              </p>
            ) : (
              displayedMeetings.map((meeting) => (
                <GroupMeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        </section>

        <section className="dashboard-panel group-page__members-panel">
          <h2 className="dashboard-panel__title">Members</h2>
          {removeError && (
            <p className="group-page__remove-error" role="alert">
              {removeError}
            </p>
          )}
          <ul className="group-page__members-list">
            {membersLoading ? (
              <li className="group-page__empty">Loading members...</li>
            ) : members.length === 0 ? (
              <li className="group-page__empty">No members yet.</li>
            ) : (
              members.map((member) => {
                const showRemove =
                  USE_MOCK_GROUPS && group.userId == null
                    ? member.role !== "leader"
                    : canRemoveGroupMember(user, group, member, members);

                return (
                  <li key={member.id} className="group-page__member">
                    <span className="group-page__member-name">{member.name}</span>
                    {member.role === "leader" && (
                      <span className="member-role-pill member-role-pill--leader">
                        Leader
                      </span>
                    )}
                    {showRemove && (
                      <div className="group-page__member-actions">
                        <button
                          type="button"
                          className="group-page__remove-btn"
                          onClick={() => {
                            setRemoveError("");
                            setMemberToRemove(member);
                          }}
                          disabled={removingMemberId === member.id}
                          aria-label={`Remove ${member.name}`}
                          title="Remove member"
                        >
                          <Icon icon="xmark" size="xs" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
          <div className="group-page__members-footer">
            <button
              type="button"
              className="group-page__invite-btn"
              onClick={() => {
                setInviteError("");
                setShowInviteModal(true);
              }}
            >
              + Invite
            </button>
          </div>
        </section>
      </div>

      {showInviteModal && (
        <InviteMembersModal
          onClose={() => {
            if (!inviting) setShowInviteModal(false);
          }}
          onSubmit={handleSendInvites}
          existingMemberIds={members.map((member) => member.id)}
          submitting={inviting}
          submitError={inviteError}
        />
      )}

      {showCreateMeetingModal && (
        <CreateMeetingModal
          fixedGroup={{ id: group.id, groupId: group.groupId, name: group.name }}
          onClose={() => setShowCreateMeetingModal(false)}
          onSubmit={async (data) => {
            await createMeeting(data);
            const result = await fetchGroupMeetings(group.groupId);
            setAllMeetings(result.meetings ?? []);
            setMeetingFilter("upcoming");
          }}
        />
      )}

      {memberToRemove && (
        <RemoveMemberModal
          memberName={memberToRemove.name}
          groupName={group.name}
          onClose={() => {
            if (!removingMemberId) setMemberToRemove(null);
          }}
          onConfirm={handleConfirmRemove}
          confirming={removingMemberId === memberToRemove.id}
        />
      )}
    </div>
  );
}
