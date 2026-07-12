import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import NotificationDetailModal from "../components/NotificationDetailModal.jsx";
import {
  fetchUserNotifications,
  markNotificationRead,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/pages/Notifications.css";

const TABS = [
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

function NotificationItem({ notification, onSelect }) {
  const message = NOTIFICATION_TYPES[notification.type] ?? notification.title ?? "New notification";

  return (
    <button
      type="button"
      className={`notifications-item${notification.read ? "" : " notifications-item--unread"}`}
      onClick={() => onSelect(notification)}
    >
      <div className="notifications-item__main">
        <span className="notifications-item__group">{notification.groupName}</span>
        {notification.meetingTitle ? (
          <span className="notifications-item__meeting">{notification.meetingTitle}</span>
        ) : null}
        <span className="notifications-item__message">{message}</span>
      </div>
      <span className="notifications-item__time">{notification.timeAgo}</span>
    </button>
  );
}

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("unread");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    setError(null);

    try {
      const items = await fetchUserNotifications(user.userId);
      setNotifications(items);
    } catch (err) {
      setError(err.message ?? "Unable to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((item) =>
        activeTab === "unread" ? !item.read : item.read,
      ),
    [notifications, activeTab],
  );

  const handleMarkRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

    try {
      await markNotificationRead(id);
    } catch {
      await loadNotifications();
    }
  }, [loadNotifications]);

  const activeSelection = selectedNotification
    ? notifications.find((item) => item.id === selectedNotification.id) ??
      selectedNotification
    : null;

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
      />

      <div className="notifications-panel">
        <div className="notifications-toggle" role="tablist" aria-label="Notification filter">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`notifications-toggle__tab${
                activeTab === tab.key ? " notifications-toggle__tab--active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="notifications-list">
          {loading ? (
            <p className="notifications-list__empty">Loading notifications...</p>
          ) : error ? (
            <p className="notifications-list__empty">{error}</p>
          ) : visibleNotifications.length === 0 ? (
            <p className="notifications-list__empty">
              {activeTab === "unread"
                ? "No unread notifications."
                : "No read notifications yet."}
            </p>
          ) : (
            visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={setSelectedNotification}
              />
            ))
          )}
        </div>
      </div>

      {activeSelection ? (
        <NotificationDetailModal
          notification={activeSelection}
          onClose={() => setSelectedNotification(null)}
          onMarkRead={handleMarkRead}
        />
      ) : null}
    </div>
  );
}

export default Notifications;
