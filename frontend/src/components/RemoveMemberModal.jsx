import { useEffect, useRef } from "react";
import "../css/components_styles/SignOutModal.css";

export default function RemoveMemberModal({
  memberName,
  groupName,
  onClose,
  onConfirm,
  confirming = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape" && !confirming) onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, confirming]);

  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current && !confirming) onClose();
  };

  return (
    <div
      className="sign-out-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
    >
      <div className="sign-out-modal">
        <div className="sign-out-modal__content">
          <h2 id="remove-member-title" className="sign-out-modal__title">
            Remove Member
          </h2>
          <p className="sign-out-modal__message">
            Are you sure you want to remove{" "}
            <strong>{memberName}</strong> from{" "}
            <strong>{groupName}</strong>?
          </p>
          <div className="sign-out-modal__actions">
            <button
              type="button"
              className="sign-out-modal__btn sign-out-modal__btn--secondary"
              onClick={onClose}
              disabled={confirming}
            >
              Cancel
            </button>
            <button
              type="button"
              className="sign-out-modal__btn sign-out-modal__btn--primary"
              onClick={onConfirm}
              disabled={confirming}
            >
              {confirming ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
