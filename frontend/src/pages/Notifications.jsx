import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import NotificationDetailModal from "../components/NotificationDetailModal.jsx";
import {
  NOTIFICATIONS_LIST,
  NOTIFICATION_TYPES,
} from "../data/notificationsMock.js";
import "../css/pages/Notifications.css";

const TABS = [
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

function NotificationItem({ notification, onSelect }) {
  const message = NOTIFICATION_TYPES[notification.type] ?? "New notification";

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
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);
  const [activeTab, setActiveTab] = useState("unread");
  const [selectedNotification, setSelectedNotification] = useState(null);

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

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

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
          {visibleNotifications.length === 0 ? (
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
