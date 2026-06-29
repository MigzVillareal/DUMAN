import PageHeader from "../components/PageHeader.jsx";
import "../css/pages/Notifications.css";

function Notifications() {
  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on meetings, groups, and invites"
      />
    </div>
  );
}

export default Notifications;
