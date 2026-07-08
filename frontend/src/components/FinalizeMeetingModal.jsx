import { useEffect, useRef, useState } from "react";
import { UNFINALIZED_MEETINGS } from "../data/meetingsMock.js";

function MemberList({ title, members, emptyLabel }) {
  return (
    <div className="finalize-members-group">
      <p className="finalize-modal__field-label">{title}</p>
      {members.length === 0 ? (
        <p className="finalize-members-group__empty">{emptyLabel}</p>
      ) : (
        <ul className="finalize-members-group__list">
          {members.map((name) => (
            <li key={name} className="finalize-members-group__item">
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FinalizeStep1({ meetings, onSelect, onClose }) {
  return (
    <div className="finalize-modal__content">
      <h2 className="finalize-modal__title">Proposed Schedules</h2>
      <p className="finalize-modal__subtitle">
        Select a meeting to finalize as a confirmed schedule
      </p>
      <div className="finalize-modal__list">
        {meetings.length === 0 ? (
          <p className="finalize-modal__empty">
            No meetings awaiting finalization.
          </p>
        ) : (
          meetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              className="finalize-proposal-card"
              onClick={() => onSelect(meeting)}
            >
              <span className="finalize-proposal-card__title">{meeting.title}</span>
              <span className="finalize-proposal-card__group">{meeting.group}</span>
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

function FinalizeStep2({ meeting, onConfirm, onCancelMeeting, onBack }) {
  const attending = meeting.attending ?? [];
  const notAttending = meeting.notAttending ?? [];

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

      <div className="finalize-modal__section finalize-modal__meta-grid">
        <div className="finalize-modal__meta-item">
          <p className="finalize-modal__field-label">Location</p>
          <p className="finalize-modal__field-value">{meeting.location}</p>
        </div>
        <div className="finalize-modal__meta-item">
          <p className="finalize-modal__field-label">Time</p>
          <p className="finalize-modal__field-value">{meeting.schedule}</p>
        </div>
      </div>

      <div className="finalize-modal__section finalize-modal__members">
        <MemberList
          title="Attending"
          members={attending}
          emptyLabel="No members attending yet."
        />
        <MemberList
          title="Not Attending"
          members={notAttending}
          emptyLabel="No members marked as not attending."
        />
      </div>

      <div className="finalize-modal__actions">
        <button
          type="button"
          className="btn-primary meetings-btn meetings-btn--outline"
          onClick={onBack}
        >
          Back
        </button>
        <div className="finalize-modal__actions-group">
          <button
            type="button"
            className="btn-primary meetings-btn meetings-btn--danger"
            onClick={() => onCancelMeeting(meeting)}
          >
            Cancel Meeting
          </button>
          <button
            type="button"
            className="btn-primary meetings-btn meetings-btn--primary"
            onClick={() => onConfirm(meeting)}
          >
            Confirm &amp; Finalize
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinalizeMeetingModal({
  onClose,
  onFinalized,
  onCancelMeeting,
  initialMeeting = null,
  meetings = UNFINALIZED_MEETINGS,
}) {
  const [step, setStep] = useState(initialMeeting ? 2 : 1);
  const [selectedMeeting, setSelectedMeeting] = useState(initialMeeting);
  const overlayRef = useRef(null);

  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSelect = (meeting) => {
    setSelectedMeeting(meeting);
    setStep(2);
  };

  const handleConfirm = (meeting) => {
    onFinalized(meeting);
    onClose();
  };

  const handleCancelMeeting = (meeting) => {
    onCancelMeeting(meeting);
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
            meetings={meetings}
            onSelect={handleSelect}
            onClose={onClose}
          />
        ) : (
          <FinalizeStep2
            meeting={selectedMeeting}
            onConfirm={handleConfirm}
            onCancelMeeting={handleCancelMeeting}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
