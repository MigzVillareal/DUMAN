import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
  canMarkMeetingFinished,
  deleteMeeting,
  fetchGroupMeetings,
  isFinishedMeetingStatus,
  isOngoingMeeting,
  isUpcomingMeetingStatus,
  mapMeetingForGroupPage,
  updateMeeting,
  updateMeetingStatus,
} from "../services/meetingService.js";
import {
  canLeaveGroup,
  canRemoveGroupMember,
  ensureOwnerAsLeader,
  isGroupLeader,
  mapApiMember,
} from "../utils/groups.js";
import Icon from "../components/Icon.jsx";
import InviteMembersModal from "../components/InviteMembersModal.jsx";
import CreateMeetingModal from "../components/CreateMeetingModal.jsx";
import RemoveMemberModal from "../components/RemoveMemberModal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import "../css/pages/GroupPage.css";
import "../css/pages/Meetings.css";

// ── Shared icon helpers ──────────────────────────────────────────────────────
function IconClose() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ width: "1em", height: "1em" }}>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Edit Group Modal ─────────────────────────────────────────────────────────
function EditGroupModal({ group, onClose, onSave }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { setError("Group title cannot be empty."); return; }
    setSaving(true); setError(null);
    try {
      await onSave(group.id, { name: trimmedName, description: description.trim() });
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to update group.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="edit-group-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gp-modal">
        <div className="gp-modal__header">
          <h2 id="edit-group-modal-title" className="gp-modal__title">Edit Group</h2>
          <button className="gp-modal__close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <form className="gp-modal__form" onSubmit={handleSubmit}>
          <label className="gp-modal__label" htmlFor="gp-edit-name">Group Title</label>
          <input
            id="gp-edit-name" ref={inputRef}
            className="gp-modal__input"
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80} required
          />
          <label className="gp-modal__label" htmlFor="gp-edit-desc">
            Description <span className="gp-modal__label-opt">(optional)</span>
          </label>
          <textarea
            id="gp-edit-desc" className="gp-modal__textarea"
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} maxLength={300} placeholder="What is this group about?"
          />
          {error && <p className="gp-modal__error">{error}</p>}
          <div className="gp-modal__actions">
            <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="gp-modal__btn gp-modal__btn--primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteGroupModal({ group, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDelete() {
    setDeleting(true); setError(null);
    try {
      await onConfirm(group.id);
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to delete group.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="delete-group-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gp-modal gp-modal--danger gp-modal--confirm">
        <div className="gp-modal__header">
          <h2 id="delete-group-modal-title" className="gp-modal__title">Delete Group</h2>
        </div>
        <div className="gp-modal__body">
          <p className="gp-modal__confirm-text">
            Are you sure you want to delete <strong>&ldquo;{group.name}&rdquo;</strong>?{" "}
            This action cannot be undone and will permanently remove the group and all its data.
          </p>
          {error && <p className="gp-modal__error">{error}</p>}
        </div>
        <div className="gp-modal__actions gp-modal__actions--footer">
          <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={deleting}>Cancel</button>
          <button type="button" className="gp-modal__btn gp-modal__btn--destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete Group"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Leave Group Modal ─────────────────────────────────────────────────────────
function LeaveGroupModal({ group, onClose, onConfirm }) {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleLeave() {
    setLeaving(true); setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to leave group.");
      setLeaving(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="leave-group-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gp-modal gp-modal--danger gp-modal--confirm">
        <div className="gp-modal__header">
          <h2 id="leave-group-modal-title" className="gp-modal__title">Leave Group</h2>
        </div>
        <div className="gp-modal__body">
          <p className="gp-modal__confirm-text">
            Are you sure you want to leave <strong>&ldquo;{group.name}&rdquo;</strong>? You will no longer see this group&apos;s meetings.
          </p>
          {error && <p className="gp-modal__error">{error}</p>}
        </div>
        <div className="gp-modal__actions gp-modal__actions--footer">
          <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={leaving}>Cancel</button>
          <button type="button" className="gp-modal__btn gp-modal__btn--destructive" onClick={handleLeave} disabled={leaving}>{leaving ? "Leaving…" : "Leave Group"}</button>
        </div>
      </div>
    </div>
  );
}

const MEETING_FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "finished", label: "Finished" },
];

function getDisplayedGroupMeetings(meetings, filter, isMock) {
  if (isMock) {
    const today = new Date().toISOString().slice(0, 10);

    return meetings
      .filter((meeting) =>
        filter === "finished" ? meeting.date < today : meeting.date >= today
      )
      .sort((a, b) => {
        const diff = a.date.localeCompare(b.date);
        return filter === "finished" ? -diff : diff;
      })
      .map((meeting, index) => ({
        ...meeting,
        defaultExpanded: index === 0,
      }));
  }

  return (meetings ?? [])
    .filter((meeting) =>
      filter === "finished"
        ? isFinishedMeetingStatus(meeting.status)
        : isUpcomingMeetingStatus(meeting.status)
    )
    .sort((a, b) => {
      const diff =
        new Date(a.schedule).getTime() - new Date(b.schedule).getTime();
      return filter === "finished" ? -diff : diff;
    })
    .map((meeting, index) => mapMeetingForGroupPage(meeting, index));
}

// ── Edit Meeting Modal ────────────────────────────────────────────────────────
function EditMeetingModal({ meeting, onClose, onSave }) {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError("Meeting title cannot be empty."); return; }
    setSaving(true); setError(null);
    try {
      await onSave(meeting.meetingId, { title: trimmedTitle, description: description.trim() });
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to update meeting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="meeting-modal-overlay"
      role="dialog" aria-modal="true" aria-labelledby="edit-meeting-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="meeting-modal">
        <div className="meeting-modal__header">
          <h2 id="edit-meeting-modal-title" className="meeting-modal__title">Edit Meeting</h2>
          <button className="meeting-modal__close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="meeting-modal__body">
          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <div className="meeting-modal__field">
              <label className="meeting-modal__label" htmlFor="em-title">Meeting Title</label>
              <input
                id="em-title" ref={inputRef}
                className="meeting-modal__input"
                type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120} required
              />
            </div>
            <div className="meeting-modal__field">
              <label className="meeting-modal__label" htmlFor="em-desc">
                Description <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span>
              </label>
              <textarea
                id="em-desc" className="meeting-modal__textarea"
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} maxLength={500} placeholder="What is this meeting about?"
              />
            </div>
            {error && <p className="meeting-modal__error">{error}</p>}
            <div className="meeting-modal__actions">
              <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="gp-modal__btn gp-modal__btn--primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Delete Meeting Confirm Modal ──────────────────────────────────────────────
function DeleteMeetingModal({ meeting, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDelete() {
    setDeleting(true); setError(null);
    try {
      await onConfirm(meeting.meetingId);
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to delete meeting.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="delete-meeting-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gp-modal gp-modal--danger gp-modal--confirm">
        <div className="gp-modal__header">
          <h2 id="delete-meeting-modal-title" className="gp-modal__title">Delete Meeting</h2>
        </div>
        <div className="gp-modal__body">
          <p className="gp-modal__confirm-text">
            Are you sure you want to delete <strong>&ldquo;{meeting.title}&rdquo;</strong>?{" "}
            This action cannot be undone.
          </p>
          {error && <p className="gp-modal__error">{error}</p>}
        </div>
        <div className="gp-modal__actions gp-modal__actions--footer">
          <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={deleting}>Cancel</button>
          <button type="button" className="gp-modal__btn gp-modal__btn--destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete Meeting"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Finish Meeting Confirm Modal ──────────────────────────────────────────────
function FinishMeetingModal({ meeting, onClose, onConfirm }) {
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleFinish() {
    setFinishing(true); setError(null);
    try {
      await onConfirm(meeting);
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to finish meeting.");
      setFinishing(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog" aria-modal="true" aria-labelledby="finish-meeting-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gp-modal gp-modal--confirm">
        <div className="gp-modal__header">
          <h2 id="finish-meeting-modal-title" className="gp-modal__title">Finish Meeting</h2>
        </div>
        <div className="gp-modal__body">
          <p className="gp-modal__confirm-text">
            Are you sure you want to mark <strong>&ldquo;{meeting.title}&rdquo;</strong> as finished?
          </p>
          {error && <p className="gp-modal__error">{error}</p>}
        </div>
        <div className="gp-modal__actions gp-modal__actions--footer">
          <button type="button" className="gp-modal__btn gp-modal__btn--ghost" onClick={onClose} disabled={finishing}>Cancel</button>
          <button type="button" className="gp-modal__btn gp-modal__btn--primary" onClick={handleFinish} disabled={finishing}>Finish Meeting</button>
        </div>
      </div>
    </div>
  );
}

function GroupMeetingCard({ meeting, canManage, onEdit, onDelete, onFinish }) {
  const [expanded, setExpanded] = useState(meeting.defaultExpanded);
  const showFinishedAction =
    canManage && canMarkMeetingFinished(meeting);

  return (
    <article className="auth-card dashboard-meeting-card">
      <div className="dashboard-meeting-card__header">
        <div className="dashboard-meeting-card__info">
          <div className="dashboard-meeting-card__title-row">
            <h3 className="dashboard-meeting-card__title">{meeting.title}</h3>
            {isOngoingMeeting(meeting) && (
              <span className="meetings-badge meetings-badge--ongoing">Ongoing</span>
            )}
            {isFinishedMeetingStatus(meeting.status) && (
              <span className="meetings-badge meetings-badge--finished">
                <Icon icon="check" size="xs" /> Finished
              </span>
            )}
          </div>
          <p className="dashboard-meeting-card__meta">{meeting.location}</p>
          <p className="dashboard-meeting-card__meta">{meeting.schedule}</p>
        </div>
        <div className="dashboard-meeting-card__actions">
          {canManage && (
            <>
              {showFinishedAction && (
                <button
                  type="button"
                  className="meetings-detail__action-btn meetings-detail__action-btn--finished"
                  onClick={() => onFinish(meeting)}
                  title="Mark meeting finished"
                  aria-label={`Mark ${meeting.title} as finished`}
                >
                  <Icon icon="check" size="xs" /> Finish
                </button>
              )}
              <button
                type="button"
                className="meetings-detail__action-btn meetings-detail__action-btn--edit"
                onClick={() => onEdit(meeting)}
                title="Edit meeting"
                aria-label={`Edit ${meeting.title}`}
              >
                <Icon icon="pen" size="xs" /> Edit
              </button>
              <button
                type="button"
                className="meetings-detail__action-btn meetings-detail__action-btn--delete"
                onClick={() => onDelete(meeting)}
                title="Delete meeting"
                aria-label={`Delete ${meeting.title}`}
              >
                <Icon icon="trash" size="xs" /> Delete
              </button>
            </>
          )}
          <button
            type="button"
            className="meetings-detail__action-btn meetings-detail__action-btn--location"
          >
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading, setGroupMembers, editGroup, removeGroup, leaveGroup } = useGroups();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);
  const [meetingToEdit, setMeetingToEdit] = useState(null);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [meetingToFinish, setMeetingToFinish] = useState(null);
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

  const userIsLeader = isGroupLeader(user, group, members);
  const userCanLeave = canLeaveGroup(user, group, members);

  const handleEditMeeting = useCallback(async (meetingId, payload) => {
    await updateMeeting(meetingId, payload);
    const result = await fetchGroupMeetings(group.groupId);
    setAllMeetings(result.meetings ?? []);
  }, [group?.groupId]);

  const handleDeleteMeeting = useCallback(async (meetingId) => {
    await deleteMeeting(meetingId);
    const result = await fetchGroupMeetings(group.groupId);
    setAllMeetings(result.meetings ?? []);
  }, [group?.groupId]);

  const handleMarkMeetingFinished = useCallback(async (meeting) => {
    await updateMeetingStatus(meeting.meetingId ?? meeting.id, "FINISHED");
    const result = await fetchGroupMeetings(group.groupId);
    setAllMeetings(result.meetings ?? []);
    setMeetingFilter("finished");
  }, [group?.groupId]);

  const handleEditGroup = useCallback(async (id, payload) => {
    await editGroup(id, payload);
  }, [editGroup]);

  const handleDeleteGroup = useCallback(async (id) => {
    await removeGroup(id);
    navigate("/groups", { replace: true });
  }, [removeGroup, navigate]);

  const handleLeaveGroup = useCallback(async () => {
    if (!USE_MOCK_GROUPS) {
      const data = await removeGroupMember(group.groupId, user.userId);
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    }

    leaveGroup(group.id);
    navigate("/groups", { replace: true });
  }, [group?.id, group?.groupId, leaveGroup, navigate, user?.userId]);

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
      throw err;
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (memberToRemove) {
      await handleRemoveMember(memberToRemove);
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
          <div className="group-page__header-actions">
            {userIsLeader && (
              <div className="meetings-detail__actions">
                <button
                  type="button"
                  className="meetings-detail__action-btn meetings-detail__action-btn--edit"
                  title="Edit group"
                  aria-label="Edit group"
                  onClick={() => setShowEditModal(true)}
                >
                  <Icon icon="pen" size="xs" />
                  Edit
                </button>
                <button
                  type="button"
                  className="meetings-detail__action-btn meetings-detail__action-btn--delete"
                  title="Delete group"
                  aria-label="Delete group"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Icon icon="trash" size="xs" />
                  Delete
                </button>
              </div>
            )}
            {userCanLeave && (
              <button
                type="button"
                className="meetings-detail__action-btn meetings-detail__action-btn--delete"
                title="Leave group"
                aria-label="Leave group"
                onClick={() => setShowLeaveModal(true)}
              >
                <Icon icon="signout" size="xs" />
                Leave Group
              </button>
            )}
            <button
              type="button"
              className="page-action-btn page-action-btn--primary"
              onClick={() => setShowCreateMeetingModal(true)}
            >
              <Icon icon="plus" size="sm" />
              Create Meeting
            </button>
          </div>
        }
      />

      <div className="group-page__grid">
        <section className="dashboard-panel">
          <div className="group-page__meetings-header">
            <h2 className="dashboard-panel__title">
              {meetingFilter === "finished" ? "Finished Group Meetings" : "Upcoming Group Meetings"}
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
                {meetingFilter === "finished"
                  ? "No finished meetings."
                  : "No upcoming meetings scheduled."}
              </p>
            ) : (
              displayedMeetings.map((meeting) => (
                <GroupMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  canManage={userIsLeader}
                  onEdit={(m) => setMeetingToEdit(m)}
                  onDelete={(m) => setMeetingToDelete(m)}
                  onFinish={(m) => setMeetingToFinish(m)}
                />
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

      {meetingToEdit && (
        <EditMeetingModal
          meeting={meetingToEdit}
          onClose={() => setMeetingToEdit(null)}
          onSave={handleEditMeeting}
        />
      )}

      {meetingToDelete && (
        <DeleteMeetingModal
          meeting={meetingToDelete}
          onClose={() => setMeetingToDelete(null)}
          onConfirm={handleDeleteMeeting}
        />
      )}

      {meetingToFinish && (
        <FinishMeetingModal
          meeting={meetingToFinish}
          onClose={() => setMeetingToFinish(null)}
          onConfirm={handleMarkMeetingFinished}
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
        />
      )}

      {showEditModal && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditGroup}
        />
      )}

      {showDeleteModal && (
        <DeleteGroupModal
          group={group}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteGroup}
        />
      )}

      {showLeaveModal && (
        <LeaveGroupModal
          group={group}
          onClose={() => setShowLeaveModal(false)}
          onConfirm={handleLeaveGroup}
        />
      )}
    </div>
  );
}
