import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import GroupsSidebar from "./GroupsSidebar";
import { GroupsProvider } from "../context/GroupsContext.jsx";
import "../css/components_styles/layout.css";

function AppLayout() {
  const { pathname } = useLocation();
  const hideSidebar = pathname === "/campus-map";

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
