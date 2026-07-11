import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../css/pages/Login.css";
import "../css/pages/Meetings.css";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import FinalizeMeetingModal from "../components/FinalizeMeetingModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useGroups } from "../context/GroupsContext.jsx";
import {
  attachAttendanceToMeeting,
  canMarkMeetingFinished,
  fetchUserMeetings,
  mapMeetingForMeetingsList,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus,
} from "../services/meetingService.js";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const labels = {
    upcoming: "Upcoming",
    finished: "Finished",
    pending: "Pending",
    cancelled: "Cancelled",
  };
  return (
    <span className={`meetings-badge meetings-badge--${status}`}>
      {labels[status] ?? status}
    </span>
  );
}

function MemberAttendance({ meeting }) {
  const attending = meeting.attending ?? [];
  const notAttending = meeting.notAttending ?? [];

  if (attending.length === 0 && notAttending.length === 0) {
    return null;
  }

  return (
    <>
      <div className="meetings-detail__field meetings-detail__field--block">
        <span className="meetings-detail__label">Attending</span>
        {attending.length === 0 ? (
          <p className="meetings-detail__value meetings-detail__value--text">
            No members attending yet.
          </p>
        ) : (
          <ul className="meetings-detail__member-list">
            {attending.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="meetings-detail__field meetings-detail__field--block">
        <span className="meetings-detail__label">Not Attending</span>
        {notAttending.length === 0 ? (
          <p className="meetings-detail__value meetings-detail__value--text">
            No members marked as not attending.
          </p>
        ) : (
          <ul className="meetings-detail__member-list">
            {notAttending.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ── Meeting list item ─────────────────────────────────────────────────────────
function MeetingListItem({ meeting, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`meetings-list-item${isSelected ? " meetings-list-item--selected" : ""}`}
      onClick={onClick}
    >
      <div className="meetings-list-item__top">
        <span className="meetings-list-item__name">
          {meeting.group} &mdash; {meeting.title}
        </span>
        <StatusBadge status={meeting.status} />
      </div>
      <p className="meetings-list-item__meta">{meeting.location}</p>
      <p className="meetings-list-item__meta">{meeting.schedule}</p>
    </button>
  );
}

// ── Edit Meeting Modal ────────────────────────────────────────────────────────
function EditMeetingModal({ meeting, onClose, onSave }) {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && !saving) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...meeting,
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message ?? "Unable to update meeting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="meeting-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-meeting-title"
    >
      <div className="meeting-modal">
        <div className="meeting-modal__header">
          <h2 id="edit-meeting-title" className="meeting-modal__title">
            Edit Meeting
          </h2>
          <button
            type="button"
            className="meeting-modal__close"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
          >
            &times;
          </button>
        </div>

        <form className="meeting-modal__body" onSubmit={handleSubmit}>
          {error && (
            <p className="meeting-modal__error" role="alert">
              {error}
            </p>
          )}
          <div className="meeting-modal__field">
            <label className="meeting-modal__label" htmlFor="edit-meeting-title-input">
              Meeting Title
            </label>
            <input
              id="edit-meeting-title-input"
              type="text"
              className="meeting-modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
              required
              autoFocus
              disabled={saving}
            />
          </div>

          <div className="meeting-modal__field">
            <label className="meeting-modal__label" htmlFor="edit-meeting-desc">
              Description
            </label>
            <textarea
              id="edit-meeting-desc"
              className="meeting-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter meeting description"
              rows={4}
              disabled={saving}
            />
          </div>

          <div className="meeting-modal__actions">
            <button
              type="button"
              className="meetings-btn meetings-btn--outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="meetings-btn meetings-btn--primary"
              disabled={!title.trim() || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteConfirmModal({ meeting, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && !deleting) onClose();
  };

  const handleConfirm = async () => {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      await onConfirm(meeting);
      onClose();
    } catch (err) {
      setError(err.message ?? "Unable to delete meeting.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="meeting-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-meeting-title"
    >
      <div className="meeting-modal meeting-modal--sm">
        <div className="meeting-modal__header">
          <h2 id="delete-meeting-title" className="meeting-modal__title">
            Delete Meeting
          </h2>
          <button
            type="button"
            className="meeting-modal__close"
            onClick={onClose}
            aria-label="Close"
            disabled={deleting}
          >
            &times;
          </button>
        </div>

        <div className="meeting-modal__body">
          {error && (
            <p className="meeting-modal__error" role="alert">
              {error}
            </p>
          )}
          <p className="meeting-modal__delete-msg">
            Are you sure you want to delete the meeting{" "}
            <strong>&ldquo;{meeting.title}&rdquo;</strong>? This action cannot be
            undone.
          </p>

          <div className="meeting-modal__actions">
            <button
              type="button"
              className="meetings-btn meetings-btn--outline"
              onClick={onClose}
              disabled={deleting}
            >
              Keep Meeting
            </button>
            <button
              type="button"
              className="meetings-btn meetings-btn--destructive"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Meeting detail panel ──────────────────────────────────────────────────────
function MeetingDetailPanel({
  meeting,
  canManage,
  onFinalize,
  onEdit,
  onDelete,
  onMarkFinished,
  markingFinished,
}) {
  if (!meeting) {
    return (
      <div className="meetings-detail meetings-detail--empty">
        <p className="meetings-detail__placeholder">
          Select a meeting to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="meetings-detail-wrap">
      <div className="meetings-detail">
        <div className="meetings-detail__header">
          <div className="meetings-detail__header-main">
            <div className="meetings-detail__title-row">
              <h2 className="meetings-detail__title">{meeting.title}</h2>
              <StatusBadge status={meeting.status} />
            </div>
            <p className="meetings-detail__group">{meeting.group}</p>
          </div>
          {canManage && (
            <div className="meetings-detail__actions">
              {meeting.status === "pending" && (
                <button
                  type="button"
                  className="meetings-detail__action-btn meetings-detail__action-btn--finalize"
                  onClick={() => onFinalize(meeting)}
                  title="Finalize meeting"
                  aria-label="Finalize meeting"
                >
                  Finalize Meeting
                </button>
              )}
              {canMarkMeetingFinished(meeting) && (
                <button
                  type="button"
                  className="meetings-detail__action-btn meetings-detail__action-btn--finished"
                  onClick={() => onMarkFinished(meeting)}
                  disabled={markingFinished}
                  title="Mark meeting finished"
                  aria-label={`Mark ${meeting.title} as finished`}
                >
                  <Icon icon="check" size="xs" />{" "}
                  {markingFinished ? "Updating..." : "Finish"}
                </button>
              )}
              <button
                type="button"
                id="edit-meeting-btn"
                className="meetings-detail__action-btn meetings-detail__action-btn--edit"
                onClick={() => onEdit(meeting)}
                title="Edit meeting"
                aria-label={`Edit ${meeting.title}`}
              >
                <Icon icon="pen" size="xs" /> Edit
              </button>
              <button
                type="button"
                id="delete-meeting-btn"
                className="meetings-detail__action-btn meetings-detail__action-btn--delete"
                onClick={() => onDelete(meeting)}
                title="Delete meeting"
                aria-label={`Delete ${meeting.title}`}
              >
                <Icon icon="trash" size="xs" /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="meetings-detail__body">
          <div className="meetings-detail__field">
            <span className="meetings-detail__label">Location</span>
            <span className="meetings-detail__value">{meeting.location}</span>
          </div>
          <div className="meetings-detail__field">
            <span className="meetings-detail__label">Schedule</span>
            <span className="meetings-detail__value">{meeting.schedule}</span>
          </div>
          <div className="meetings-detail__field meetings-detail__field--block">
            <span className="meetings-detail__label">Description</span>
            <p className="meetings-detail__value meetings-detail__value--text">
              {meeting.description}
            </p>
          </div>
          <MemberAttendance meeting={meeting} />
        </div>
      </div>
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All Meetings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "finished", label: "Finished" },
  { key: "cancelled", label: "Cancelled" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
function Meetings() {
  const { user } = useAuth();
  const { groups } = useGroups();
  const location = useLocation();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMeeting, setModalMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);
  const [markingFinishedId, setMarkingFinishedId] = useState(null);

  const loadMeetings = useCallback(async () => {
    if (!user?.userId) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await fetchUserMeetings(user.userId);
      setMeetings((data.meetings ?? []).map(mapMeetingForMeetingsList));
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  useEffect(() => {
    const meetingId = location.state?.meetingId;
    if (!meetingId || meetings.length === 0) return;

    const match = meetings.find((meeting) => meeting.id === meetingId);
    if (match) {
      setSelected(match);
      setFilter("all");
    }
  }, [location.state?.meetingId, meetings]);

  useEffect(() => {
    if (!selected?.id) return;

    let cancelled = false;

    attachAttendanceToMeeting(selected)
      .then((updated) => {
        if (cancelled) return;

        setSelected(updated);
        setMeetings((prev) =>
          prev.map((meeting) => (meeting.id === updated.id ? updated : meeting))
        );
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [selected?.id]);

  const openFinalizeModal = (meeting = null) => {
    setModalMeeting(meeting);
    setShowModal(true);
  };

  const closeFinalizeModal = () => {
    setShowModal(false);
    setModalMeeting(null);
  };

  const filtered = meetings.filter((m) => {
    const matchFilter = filter === "all" || m.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.group.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Keep selected in sync if filter hides it
  useEffect(() => {
    if (selected && !filtered.find((m) => m.id === selected.id)) {
      setSelected(null);
    }
  }, [filter, search]);

  const handleFinalized = async (meeting) => {
    const data = await updateMeetingStatus(meeting.id, "UPCOMING");
    const mapped = mapMeetingForMeetingsList(data.meeting);
    applyMeetingUpdate({
      ...meeting,
      status: mapped.status,
      finalized: mapped.finalized,
      attending: meeting.attending ?? [],
      notAttending: meeting.notAttending ?? [],
    });
  };

  const handleCancelMeeting = async (meeting) => {
    const data = await updateMeetingStatus(meeting.id, "CANCELLED");
    const mapped = mapMeetingForMeetingsList(data.meeting);
    applyMeetingUpdate({
      ...meeting,
      status: mapped.status,
      finalized: mapped.finalized,
      attending: meeting.attending ?? [],
      notAttending: meeting.notAttending ?? [],
    });

    if (selected?.id === meeting.id) {
      setSelected(null);
    }
  };

  const applyMeetingUpdate = (updated) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
    if (selected?.id === updated.id) {
      setSelected((prev) => ({ ...prev, ...updated }));
    }
  };

  const removeMeeting = (meetingId) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (selected?.id === meetingId) {
      setSelected(null);
    }
  };

  // ── Edit handler ────────────────────────────────────────────────────────────
  const handleEditSave = async (updated) => {
    const data = await updateMeeting(updated.id, {
      title: updated.title,
      description: updated.description,
    });
    const mapped = mapMeetingForMeetingsList(data.meeting);
    applyMeetingUpdate({
      ...mapped,
      attending: updated.attending ?? [],
      notAttending: updated.notAttending ?? [],
    });
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDeleteConfirm = async (meeting) => {
    await deleteMeeting(meeting.id);
    removeMeeting(meeting.id);
  };

  const handleMarkFinished = async (meeting) => {
    setMarkingFinishedId(meeting.id);
    try {
      const data = await updateMeetingStatus(meeting.id, "FINISHED");
      const mapped = mapMeetingForMeetingsList(data.meeting);
      applyMeetingUpdate({
        ...meeting,
        ...mapped,
        attending: meeting.attending ?? [],
        notAttending: meeting.notAttending ?? [],
      });
      setFilter("finished");
    } finally {
      setMarkingFinishedId(null);
    }
  };

  // A user can manage a meeting if they are the owner (userId) of that meeting's group
  const canManageMeeting = (meeting) => {
    if (!meeting || !user) return false;
    const matchedGroup = (groups ?? []).find(
      (g) => g.groupId != null && Number(g.groupId) === Number(meeting.groupId)
    );
    if (!matchedGroup) return false;
    return Number(matchedGroup.userId) === Number(user.userId);
  };

  return (
    <div className="meetings-page">
      {/* ── Page Header ── */}
      <PageHeader
        title="Meetings"
        subtitle="Your finalized scheduled meetings"
        action={
          <button
            type="button"
            id="finalize-meeting-btn"
            className="meetings-btn meetings-btn--primary"
            onClick={() => openFinalizeModal()}
          >
            Finalize Meeting
          </button>
        }
      />

      {/* ── Filter Tabs ── */}
      <nav className="meetings-filters" aria-label="Meeting filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            id={`meetings-filter-${f.key}`}
            className={`meetings-filter-tab${filter === f.key ? " meetings-filter-tab--active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* ── Content Area ── */}
      <div className="meetings-content">
        {/* Left: Meeting List */}
        <div className="meetings-list-panel">
          <div className="meetings-list-panel__search-wrap">
            <span className="meetings-list-panel__search-icon">
              <Icon icon="search" size="sm" />
            </span>
            <input
              id="meetings-search"
              type="text"
              className="meetings-list-panel__search"
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="meetings-list-panel__list">
            {loading ? (
              <p className="meetings-list-panel__empty">Loading meetings...</p>
            ) : filtered.length === 0 ? (
              <p className="meetings-list-panel__empty">No meetings found.</p>
            ) : (
              filtered.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  meeting={meeting}
                  isSelected={selected?.id === meeting.id}
                  onClick={() => setSelected(meeting)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="meetings-detail-panel">
          <MeetingDetailPanel
            meeting={selected}
            canManage={canManageMeeting(selected)}
            onFinalize={openFinalizeModal}
            onEdit={(m) => setEditingMeeting(m)}
            onDelete={(m) => setDeletingMeeting(m)}
            onMarkFinished={handleMarkFinished}
            markingFinished={markingFinishedId === selected?.id}
          />
        </div>
      </div>

      {/* ── Finalize Modal ── */}
      {showModal && (
        <FinalizeMeetingModal
          initialMeeting={modalMeeting}
          meetings={meetings.filter((m) => !m.finalized)}
          onClose={closeFinalizeModal}
          onFinalized={handleFinalized}
          onCancelMeeting={handleCancelMeeting}
        />
      )}

      {/* ── Edit Meeting Modal ── */}
      {editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingMeeting && (
        <DeleteConfirmModal
          meeting={deletingMeeting}
          onClose={() => setDeletingMeeting(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default Meetings;
