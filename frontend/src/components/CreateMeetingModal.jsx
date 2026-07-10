import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import "../css/components_styles/CreateMeetingModal.css";
import "../css/pages/CampusMap.css";
import {
  campusLocations,
  locationHasRoomSelection,
} from "../data/campusLocations.js";

const STEPS = ["Location", "Details"];

function formatSelectedLocation(form) {
  const location = campusLocations.find((item) => item.id === form.locationId);
  if (!location) return "";

  if (locationHasRoomSelection(location) && form.floor && form.room) {
    return `${location.building} · Floor ${form.floor} · ${form.room}`;
  }

  return location.building;
}

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

/* ── Step 1 — Location ───────────────────────────────────────────── */
function StepLocation({ form, onLocationChange, onFieldChange }) {
  const [locationSearch, setLocationSearch] = useState("");

  const selectedLocation = campusLocations.find(
    (location) => location.id === form.locationId
  );
  const hasRoomSelection = selectedLocation
    ? locationHasRoomSelection(selectedLocation)
    : false;

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!query) return campusLocations;

    return campusLocations.filter((location) =>
      location.building.toLowerCase().includes(query)
    );
  }, [locationSearch]);

  function selectLocation(location) {
    if (locationHasRoomSelection(location)) {
      const floor = location.floors[0];
      onLocationChange({
        locationId: location.id,
        floor,
        room: "",
      });
      return;
    }

    onLocationChange({
      locationId: location.id,
      floor: "",
      room: "",
    });
  }

  function handleFloorChange(event) {
    const floor = event.target.value;
    onLocationChange({
      locationId: form.locationId,
      floor,
      room: "",
    });
  }

  return (
    <div className="cmm-step-body cmm-step-body--location">
      <div className="cmm-location-picker">
        <section className="cmm-location-picker__list campus-map-all-locations-card">
          <header className="campus-map-all-locations-card__header">
            <h3 className="campus-map-all-locations-card__title">All Locations</h3>
          </header>
          <div className="campus-map-all-locations-card__search-wrap">
            <span className="campus-map-all-locations-card__search-icon">
              <Icon icon="search" size="sm" />
            </span>
            <input
              id="cmm-locations-search"
              type="text"
              className="campus-map-all-locations-card__search"
              placeholder="Search locations..."
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
            />
          </div>
          <ul className="campus-map-all-locations-card__list">
            {filteredLocations.length === 0 ? (
              <li className="campus-map-all-locations-card__empty">No locations found.</li>
            ) : (
              filteredLocations.map((location) => (
                <li key={location.id}>
                  <button
                    type="button"
                    className={`campus-map-location-item${selectedLocation?.id === location.id ? " campus-map-location-item--active" : ""}`}
                    onClick={() => selectLocation(location)}
                  >
                    <span className="campus-map-location-item__name">{location.building}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="cmm-location-picker__details campus-map-selected-room-card">
          {selectedLocation ? (
            <>
              <header className="campus-map-selected-room-card__header">
                <h3 className="campus-map-selected-room-card__room-code">
                  {selectedLocation.building}
                </h3>
              </header>
              <div className="campus-map-selected-room-card__details">
                <label className="campus-map-detail-field" htmlFor="cmm-location-floor">
                  <span className="campus-map-detail-field__label">Floor Number</span>
                  <select
                    id="cmm-location-floor"
                    className="campus-map-select"
                    value={hasRoomSelection ? form.floor : ""}
                    onChange={handleFloorChange}
                    disabled={!hasRoomSelection}
                  >
                    {hasRoomSelection ? (
                      selectedLocation.floors.map((floor) => (
                        <option key={floor} value={floor}>
                          Floor {floor}
                        </option>
                      ))
                    ) : (
                      <option value="">Not applicable</option>
                    )}
                  </select>
                </label>

                <label className="campus-map-detail-field" htmlFor="cmm-location-room">
                  <span className="campus-map-detail-field__label">Room</span>
                  <input
                    id="cmm-location-room"
                    className="campus-map-select"
                    type="text"
                    value={hasRoomSelection ? form.room : ""}
                    onChange={(event) => onFieldChange("room", event.target.value)}
                    disabled={!hasRoomSelection}
                    placeholder="Enter room number or room name"
                  />
                </label>
              </div>
            </>
          ) : (
            <p className="campus-map-selected-room-card__instruction">
              Select a location to view details.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Step 2 — Details ────────────────────────────────────────────── */
function StepDetails({ form, onChange, fixedGroup, groups = [] }) {
  const selectedLocationLabel = formatSelectedLocation(form);

  return (
    <div className="cmm-step-body">
      {selectedLocationLabel && (
        <div className="cmm-selected-location">
          <span className="cmm-selected-location__label">Location</span>
          <p className="cmm-selected-location__value">{selectedLocationLabel}</p>
        </div>
      )}

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
                {groups.map((group) => (
                  <option key={group.groupId} value={group.groupId}>
                    {group.name}
                  </option>
                ))}
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

/* ── Main modal ──────────────────────────────────────────────────── */
const INITIAL_FORM = {
  group: "",
  title: "",
  description: "",
  deadline: "",
  date: "",
  start: "",
  end: "",
  locationId: "",
  floor: "",
  room: "",
};

function createInitialForm(fixedGroup, fixedLocation) {
  return {
    ...INITIAL_FORM,
    group: fixedGroup?.groupId ?? fixedGroup?.id ?? "",
    locationId: fixedLocation?.locationId ?? "",
    floor: fixedLocation?.floor ?? "",
    room: fixedLocation?.room ?? "",
  };
}

export default function ProposeScheduleModal({
  onClose,
  onSubmit,
  fixedGroup,
  fixedLocation,
  groups = [],
}) {
  const skipLocationStep = Boolean(fixedLocation);
  const [step, setStep] = useState(() => (skipLocationStep ? 1 : 0));
  const [form, setForm] = useState(() => createInitialForm(fixedGroup, fixedLocation));
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

  const handleLocationChange = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 0 && !skipLocationStep) {
      if (!form.locationId) return "Please select a location.";
    }
    if (step === 1) {
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
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.(form);
      setForm(createInitialForm(fixedGroup, fixedLocation));
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
      <div className={`cmm-modal${step === 0 && !skipLocationStep ? " cmm-modal--wide" : ""}`}>
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
        {!skipLocationStep && <StepIndicator currentStep={step} />}

        {/* Error */}
        {error && (
          <p className="cmm-error" role="alert">
            {error}
          </p>
        )}

        {/* Step content */}
        {step === 0 && !skipLocationStep && (
          <StepLocation
            form={form}
            onLocationChange={handleLocationChange}
            onFieldChange={handleChange}
          />
        )}
        {step === 1 && (
          <StepDetails
            form={form}
            onChange={handleChange}
            fixedGroup={fixedGroup}
            groups={groups}
          />
        )}

        {/* Footer */}
        <div className="cmm-footer">
          {step === 0 || skipLocationStep ? (
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
