import { useState, useEffect, useRef } from "react";
import "../css/pages/Login.css";
import "../css/pages/Dashboard.css";
import "../css/pages/Meetings.css";
import Icon from "../components/Icon.jsx";
import { MEETINGS_LIST, UNFINALIZED_MEETINGS } from "../data/meetingsMock.js";

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
function MeetingDetailPanel({ meeting }) {
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
        <div className="meetings-detail__field meetings-detail__field--block">
          <span className="meetings-detail__label">Agenda</span>
          <ul className="meetings-detail__agenda">
            {meeting.agenda.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Finalize Modal — Step 1: pick a meeting ───────────────────────────────────
function FinalizeStep1({ meetings, onSelect, onClose }) {
  return (
    <div className="finalize-modal__content">
      <h2 className="finalize-modal__title">Proposed Schedules</h2>
      <p className="finalize-modal__subtitle">
        Select a proposal to finalize as a confirmed meeting
      </p>
      <div className="finalize-modal__list">
        {meetings.length === 0 ? (
          <p className="finalize-modal__empty">
            No meetings awaiting finalization.
          </p>
        ) : (
          meetings.map((m) => (
            <button
              key={m.id}
              type="button"
              className="finalize-proposal-card"
              onClick={() => onSelect(m)}
            >
              <span className="finalize-proposal-card__title">{m.title}</span>
              <span className="finalize-proposal-card__group">{m.group}</span>
            </button>
          ))
        )}
      </div>
      <div className="finalize-modal__actions finalize-modal__actions--right">
        <button
          type="button"
          className="btn-primary meetings-btn meetings-btn--outline"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Finalize Modal — Step 2: show votes & confirm ─────────────────────────────
function FinalizeStep2({ meeting, onConfirm, onBack }) {
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <div className="finalize-modal__content">
      <h2 className="finalize-modal__title">Finalized Meeting</h2>

      <div className="finalize-modal__section">
        <p className="finalize-modal__field-label">Meeting Title</p>
        <p className="finalize-modal__field-value">{meeting.title}</p>
        <p className="finalize-modal__field-label finalize-modal__field-label--sub">
          Group Name
        </p>
        <p className="finalize-modal__field-value finalize-modal__field-value--sub">
          {meeting.group}
        </p>
      </div>

      <div className="finalize-modal__section">
        <p className="finalize-modal__field-label">Winning Time Slot</p>
        <div className="finalize-vote-list">
          {meeting.proposedTimes.map((slot) => {
            const pct = Math.round((slot.votes / slot.total) * 100);
            const isSelected = selectedTime?.id === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                className={`finalize-vote-row${isSelected ? " finalize-vote-row--selected" : ""}`}
                onClick={() => setSelectedTime(slot)}
              >
                <span className="finalize-vote-row__label">{slot.label}</span>
                <div className="finalize-vote-row__bar-wrap">
                  <div
                    className="finalize-vote-row__bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="finalize-vote-row__count">
                  {slot.votes}/{slot.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="finalize-modal__section finalize-modal__meta-grid">
        <div className="finalize-modal__meta-item">
          <p className="finalize-modal__field-label">Location</p>
          <p className="finalize-modal__field-value">{meeting.location}</p>
        </div>
        <div className="finalize-modal__meta-item">
          <p className="finalize-modal__field-label">Time</p>
          <p className="finalize-modal__field-value">
            {selectedTime ? selectedTime.label : "—"}
          </p>
        </div>
        <div className="finalize-modal__meta-item finalize-modal__meta-item--full">
          <p className="finalize-modal__field-label">Agenda</p>
          <ul className="finalize-modal__agenda">
            {meeting.agenda.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="finalize-modal__actions">
        <button
          type="button"
          className="btn-primary meetings-btn meetings-btn--outline"
          onClick={onBack}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary meetings-btn meetings-btn--primary"
          disabled={!selectedTime}
          onClick={() => onConfirm(meeting, selectedTime)}
        >
          Confirm &amp; Finalize
        </button>
      </div>
    </div>
  );
}

// ── Finalize Modal Wrapper ────────────────────────────────────────────────────
function FinalizeModal({ onClose, onFinalized }) {
  const [step, setStep] = useState(1);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const overlayRef = useRef(null);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Trap escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSelect = (meeting) => {
    setSelectedMeeting(meeting);
    setStep(2);
  };

  const handleConfirm = (meeting, time) => {
    onFinalized(meeting, time);
    onClose();
  };

  return (
    <div
      className="finalize-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={step === 1 ? "Proposed Schedules" : "Finalized Meeting"}
    >
      <div className="finalize-modal">
        {step === 1 ? (
          <FinalizeStep1
            meetings={UNFINALIZED_MEETINGS}
            onSelect={handleSelect}
            onClose={onClose}
          />
        ) : (
          <FinalizeStep2
            meeting={selectedMeeting}
            onConfirm={handleConfirm}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All Meetings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "voting", label: "Voting" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
function Meetings() {
  const [meetings, setMeetings] = useState(MEETINGS_LIST);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      <section className="dashboard-welcome meetings-page-header">
        <div className="meetings-page-header__text">
          <h1 className="dashboard-welcome__title">Meetings</h1>
          <p className="dashboard-welcome__subtitle">
            Your finalized scheduled meetings
          </p>
        </div>
        <button
          type="button"
          id="finalize-meeting-btn"
          className="meetings-btn meetings-btn--primary"
          onClick={() => setShowModal(true)}
        >
          Finalize Meeting
        </button>
      </section>

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
          <MeetingDetailPanel meeting={selected} />
        </div>
      </div>

      {/* ── Finalize Modal ── */}
      {showModal && (
        <FinalizeModal
          onClose={() => setShowModal(false)}
          onFinalized={handleFinalized}
        />
      )}
    </div>
  );
}

export default Meetings;
