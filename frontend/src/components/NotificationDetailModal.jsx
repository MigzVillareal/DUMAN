import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  NOTIFICATION_TYPES,
  getNotificationDestination,
} from "../data/notificationsMock.js";
import "../css/components_styles/NotificationDetailModal.css";

export default function NotificationDetailModal({ notification, onClose, onMarkRead }) {
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  }, [notification, onMarkRead]);

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

  const message = NOTIFICATION_TYPES[notification.type] ?? "New notification";
  const destination = getNotificationDestination(notification);

  const handleGoTo = () => {
    navigate(destination.path, destination.state ? { state: destination.state } : undefined);
    onClose();
  };

  return (
    <div
      className="notification-detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-detail-title"
    >
      <div className="notification-detail-modal">
        <div className="notification-detail-modal__content">
          <h2 id="notification-detail-title" className="notification-detail-modal__title">
            {message}
          </h2>

          <dl className="notification-detail-modal__details">
            <div className="notification-detail-modal__row">
              <dt>Group</dt>
              <dd>{notification.groupName}</dd>
            </div>
            {notification.meetingTitle ? (
              <div className="notification-detail-modal__row">
                <dt>Meeting</dt>
                <dd>{notification.meetingTitle}</dd>
              </div>
            ) : null}
          </dl>

          <div className="notification-detail-modal__actions">
            <button
              type="button"
              className="notification-detail-modal__btn notification-detail-modal__btn--secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="notification-detail-modal__btn notification-detail-modal__btn--primary"
              onClick={handleGoTo}
            >
              {destination.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
