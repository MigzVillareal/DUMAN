import { useState, useEffect } from "react";
import "../css/pages/Login.css";
import "../css/pages/Meetings.css";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import FinalizeMeetingModal from "../components/FinalizeMeetingModal.jsx";
import { MEETINGS_LIST, UNFINALIZED_MEETINGS } from "../data/meetingsMock.js";
import { USE_MOCK_MEETINGS } from "../data/mock.js";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const labels = { upcoming: "Upcoming", past: "Past", voting: "Voting" };
  return (
    <span className={`meetings-badge meetings-badge--${status}`}>
      {labels[status] ?? status}
    </span>
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

// ── Meeting detail panel ──────────────────────────────────────────────────────
function MeetingDetailPanel({ meeting, onFinalize }) {
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
        <div>
          <h2 className="meetings-detail__title">{meeting.title}</h2>
          <p className="meetings-detail__group">{meeting.group}</p>
        </div>
        <StatusBadge status={meeting.status} />
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
      </div>
      </div>

      {meeting.status === "voting" && (
        <div className="meetings-detail__footer">
          <button
            type="button"
            className="meetings-btn meetings-btn--primary meetings-detail__finalize-btn"
            onClick={() => onFinalize(meeting)}
          >
            Finalized Meeting
          </button>
        </div>
      )}
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All Meetings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "voting", label: "Voting" },
  { key: "past", label: "Past" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
function Meetings() {
  const [meetings, setMeetings] = useState(USE_MOCK_MEETINGS ? MEETINGS_LIST : []);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMeeting, setModalMeeting] = useState(null);

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

  const handleFinalized = (meeting, time) => {
    // Mark the meeting as finalized and update schedule to chosen time
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meeting.id
          ? { ...m, finalized: true, status: "upcoming", schedule: time.label }
          : m
      )
    );
    // Update selected if it's the same meeting
    if (selected?.id === meeting.id) {
      setSelected((prev) => ({
        ...prev,
        finalized: true,
        status: "upcoming",
        schedule: time.label,
      }));
    }
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
            {filtered.length === 0 ? (
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
          <MeetingDetailPanel meeting={selected} onFinalize={openFinalizeModal} />
        </div>
      </div>

      {/* ── Finalize Modal ── */}
      {showModal && (
        <FinalizeMeetingModal
          initialMeeting={modalMeeting}
          meetings={USE_MOCK_MEETINGS ? UNFINALIZED_MEETINGS : []}
          onClose={closeFinalizeModal}
          onFinalized={handleFinalized}
        />
      )}
    </div>
  );
}

export default Meetings;
