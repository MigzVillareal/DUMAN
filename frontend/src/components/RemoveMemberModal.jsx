import { useEffect, useState } from "react";
import "../css/pages/GroupPage.css";

export default function RemoveMemberModal({
  memberName,
  groupName,
  onClose,
  onConfirm,
}) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !removing) onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, removing]);

  async function handleRemove() {
    setRemoving(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message ?? "Failed to remove member.");
      setRemoving(false);
    }
  }

  return (
    <div
      className="gp-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-modal-title"
      onClick={(e) => e.target === e.currentTarget && !removing && onClose()}
    >
      <div className="gp-modal gp-modal--danger gp-modal--confirm">
        <div className="gp-modal__header">
          <h2 id="remove-member-modal-title" className="gp-modal__title">
            Remove Member
          </h2>
        </div>
        <div className="gp-modal__body">
          <p className="gp-modal__confirm-text">
            Are you sure you want to remove <strong>{memberName}</strong> from{" "}
            <strong>&ldquo;{groupName}&rdquo;</strong>?
          </p>
          {error && <p className="gp-modal__error">{error}</p>}
        </div>
        <div className="gp-modal__actions gp-modal__actions--footer">
          <button
            type="button"
            className="gp-modal__btn gp-modal__btn--ghost"
            onClick={onClose}
            disabled={removing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="gp-modal__btn gp-modal__btn--destructive"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing…" : "Remove Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
