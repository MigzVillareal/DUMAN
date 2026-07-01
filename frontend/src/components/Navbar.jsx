import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import SignOutModal from "./SignOutModal.jsx";
import "../css/components_styles/navbar.css";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/calendar", label: "Calendar" },
  { to: "/campus-map", label: "Campus Map" },
  { to: "/meetings", label: "Meetings" },
];

export default function Navbar() {
  const [hasNotification, setHasNotification] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <span className="navbar__logo-text">DUMAN</span>
        <span className="navbar__logo-icon">
          <Icon icon="location-dot" size="sm" />
        </span>
      </div>

      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="navbar__right">
        <button
          className="navbar__bell-btn"
          onClick={() => {
            setHasNotification(false);
            navigate("/notifications");
          }}
          title="Notifications"
        >
          <Icon icon="bell" />
          {hasNotification && <span className="navbar__notif-dot" />}
        </button>

        <div className="navbar__user-pill">
          <div className="navbar__user-icon-wrapper">
            <Icon icon="user" size="sm" />
          </div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">Juan Cruz</span>
            <span className="navbar__user-role">Student</span>
          </div>
        </div>

        <div className="navbar__signout">  
          <button
            className="navbar__signout-btn"
            onClick={() => setShowSignOutModal(true)}
            title="Sign Out"
          >
            <Icon icon="signout" />
          </button>
        </div>
      </div>
      {showSignOutModal && (
        <SignOutModal onClose={() => setShowSignOutModal(false)} />
      )}
    </nav>
  );
}
