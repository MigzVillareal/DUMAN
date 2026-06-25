import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import GroupsSidebar from "./GroupsSidebar";
import "../css/layout.css";

function AppLayout() {
  return (
    <div className="app-layout app-layout--topnav">
      {/* Top navbar */}
      <Navbar />

      {/* Below navbar: sidebar + content */}
      <div className="app-body">
        <GroupsSidebar />
        <main className="container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
