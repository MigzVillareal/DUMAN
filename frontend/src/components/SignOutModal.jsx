import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/components_styles/SignOutModal.css";

export default function SignOutModal({ onClose }) {
  const overlayRef = useRef(null);
  const { clearUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current) onClose();
  };

  const handleSignOut = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <div
      className="sign-out-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-title"
    >
      <div className="sign-out-modal">
        <div className="sign-out-modal__content">
          <h2 id="sign-out-title" className="sign-out-modal__title">
            Sign Out
          </h2>
          <p className="sign-out-modal__message">
            Are you sure you want to sign out?
          </p>
          <div className="sign-out-modal__actions">
            <button
              type="button"
              className="sign-out-modal__btn sign-out-modal__btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="sign-out-modal__btn sign-out-modal__btn--primary"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
