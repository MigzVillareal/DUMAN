import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyGroups from "./pages/MyGroups.jsx";
import Calendar from "./pages/Calendar.jsx";
import CampusMap from "./pages/CampusMap.jsx";
import Meetings from "./pages/Meetings.jsx";
import Notifications from "./pages/Notifications.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-groups" element={<MyGroups />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
