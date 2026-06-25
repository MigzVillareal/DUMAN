import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/navbar.css";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* Only the main page links — My Groups lives in the sidebar, Notifications uses the bell */
const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/calendar", label: "Calendar" },
  { to: "/campus-map", label: "Campus Map" },
  { to: "/meetings", label: "Meetings" },
];

export default function Navbar() {
  const [hasNotification, setHasNotification] = useState(true);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <span className="navbar__logo-text">DUMAN</span>
        <span className="navbar__logo-icon">
          <LocationIcon />
        </span>
      </div>

      {/* Nav Links */}
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

      {/* Right Side */}
      <div className="navbar__right">
        {/* Bell — navigates to /notifications */}
        <button
          className="navbar__bell-btn"
          onClick={() => {
            setHasNotification(false);
            navigate("/notifications");
          }}
          title="Notifications"
        >
          <BellIcon />
          {hasNotification && <span className="navbar__notif-dot" />}
        </button>

        {/* User Pill */}
        <div className="navbar__user-pill">
          <div className="navbar__user-icon-wrapper">
            <UserIcon />
          </div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">Juan Cruz</span>
            <span className="navbar__user-role">Student</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
