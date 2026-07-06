import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import "../css/components_styles/CreateMeetingModal.css";

const STEPS = ["Details", "Location"];

/* ── Step indicator tabs ─────────────────────────────────────────── */
function StepIndicator({ currentStep }) {
  return (
    <div className="cmm-steps" aria-label="Progress">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className={`cmm-step-tab${i === currentStep ? " cmm-step-tab--active" : ""}${i < currentStep ? " cmm-step-tab--done" : ""}`}
          aria-current={i === currentStep ? "step" : undefined}
        >
          <span className="cmm-step-tab__dot" aria-hidden="true" />
          {label}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1 — Details ────────────────────────────────────────────── */
function StepDetails({ form, onChange, fixedGroup }) {
  return (
    <div className="cmm-step-body">
      {fixedGroup ? (
        <div className="cmm-field">
          <label className="cmm-label" htmlFor="cmm-title">
            Meeting Title
          </label>
          <input
            id="cmm-title"
            className="cmm-input"
            type="text"
            placeholder="e.g. Weekly Sync"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            maxLength={120}
          />
        </div>
      ) : (
        <div className="cmm-row cmm-row--two">
          <div className="cmm-field">
            <label className="cmm-label" htmlFor="cmm-group">
              Group
            </label>
            <div className="cmm-select-wrap">
              <select
                id="cmm-group"
                className="cmm-input cmm-select"
                value={form.group}
                onChange={(e) => onChange("group", e.target.value)}
              >
                <option value="">Select group…</option>
                <option value="research">Research</option>
                <option value="volunteer">Volunteer</option>
                <option value="study">Study Group</option>
              </select>
              <span className="cmm-select-arrow" aria-hidden="true">&#8964;</span>
            </div>
          </div>

          <div className="cmm-field">
            <label className="cmm-label" htmlFor="cmm-title">
              Meeting Title
            </label>
            <input
              id="cmm-title"
              className="cmm-input"
              type="text"
              placeholder="e.g. Weekly Sync"
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="cmm-field">
        <label className="cmm-label" htmlFor="cmm-description">
          Description
        </label>
        <textarea
          id="cmm-description"
          className="cmm-input cmm-textarea"
          placeholder="What is this meeting about?"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>

      {/* Voting Deadline */}
      <div className="cmm-field cmm-field--half">
        <label className="cmm-label" htmlFor="cmm-deadline">
          Voting Deadline
        </label>
        <input
          id="cmm-deadline"
          className="cmm-input"
          type="date"
          value={form.deadline}
          onChange={(e) => onChange("deadline", e.target.value)}
        />
      </div>

      {/* Meeting Time */}
      <div className="cmm-field">
        <span className="cmm-label">Meeting Time</span>
        <div className="cmm-slot-row">
          <input
            id="cmm-date"
            className="cmm-input cmm-slot-date"
            type="date"
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
            aria-label="Meeting date"
          />
          <input
            id="cmm-start"
            className="cmm-input cmm-slot-time"
            type="time"
            value={form.start}
            onChange={(e) => onChange("start", e.target.value)}
            aria-label="Meeting start time"
          />
          <span className="cmm-slot-sep">–</span>
          <input
            id="cmm-end"
            className="cmm-input cmm-slot-time"
            type="time"
            value={form.end}
            onChange={(e) => onChange("end", e.target.value)}
            aria-label="Meeting end time"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 2 — Location (map placeholder) ────────────────────────── */
function StepLocation() {
  return (
    <div className="cmm-step-body">
      <p className="cmm-location-hint">
        Tap a pin to select a preferred meeting location.
      </p>
      <div
        className="cmm-map-placeholder"
        aria-label="Campus map (coming soon)"
      />
    </div>
  );
}

/* ── Main modal ──────────────────────────────────────────────────── */
const INITIAL_FORM = {
  group: "",
  title: "",
  description: "",
  deadline: "",
  date: "",
  start: "",
  end: "",
};

function createInitialForm(fixedGroup) {
  return {
    ...INITIAL_FORM,
    group: fixedGroup?.id ?? "",
  };
}

export default function ProposeScheduleModal({ onClose, onSubmit, fixedGroup }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => createInitialForm(fixedGroup));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef(null);

  /* Keyboard close */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!fixedGroup && !form.group) return "Please select a group.";
      if (!form.title.trim()) return "Meeting title is required.";
    }
    return "";
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit?.(form);
      onClose();
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div
      className="cmm-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmm-heading"
    >
      <div className="cmm-modal">
        {/* Header */}
        <div className="cmm-header">
          <h2 id="cmm-heading" className="cmm-heading">
            Create Meeting
          </h2>
          <button
            type="button"
            className="cmm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon icon="xmark" size="sm" />
          </button>
        </div>

        {/* Step tabs */}
        <StepIndicator currentStep={step} />

        {/* Error */}
        {error && (
          <p className="cmm-error" role="alert">
            {error}
          </p>
        )}

        {/* Step content */}
        {step === 0 && (
          <StepDetails
            form={form}
            onChange={handleChange}
            fixedGroup={fixedGroup}
          />
        )}
        {step === 1 && <StepLocation />}

        {/* Footer */}
        <div className="cmm-footer">
          {step === 0 ? (
            <button
              type="button"
              className="cmm-btn cmm-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="cmm-btn cmm-btn--secondary"
              onClick={handleBack}
              disabled={submitting}
            >
              Go back
            </button>
          )}

          {isLastStep ? (
            <button
              type="button"
              className="cmm-btn cmm-btn--primary"
              id="cmm-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send to group"}
            </button>
          ) : (
            <button
              type="button"
              className="cmm-btn cmm-btn--primary"
              id="cmm-next-btn"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
