import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import GroupsSidebar from "./GroupsSidebar";
import { GroupsProvider } from "../context/GroupsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/components_styles/layout.css";

function AppLayout() {
  const { pathname } = useLocation();
  const { user, token } = useAuth();
  const hideSidebar = pathname === "/campus-map";

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  return (
    <GroupsProvider>
      <div className="app-layout app-layout--topnav">
        <Navbar />

        <div className={`app-body${hideSidebar ? " app-body--no-sidebar" : ""}`}>
          {!hideSidebar && <GroupsSidebar />}
          <main className="container">
            <Outlet />
          </main>
        </div>
      </div>
    </GroupsProvider>
  );
}

export default AppLayout;
