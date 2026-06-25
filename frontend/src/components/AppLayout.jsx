import { NavLink, Outlet } from "react-router-dom";
import "../css/layout.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/my-groups", label: "My Groups" },
  { to: "/calendar", label: "Calendar" },
  { to: "/campus-map", label: "Campus Map" },
  { to: "/meetings", label: "Meetings" },
  { to: "/notifications", label: "Notifications" },
];

function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <h1 className="topbar-title">DUMAN</h1>
        </header>
        <main className="container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
