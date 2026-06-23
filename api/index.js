import "./config.js";
import express from "express";
import UserRoute from "./routes/User.routes.js";
import AuthRoute from "./routes/Auth.routes.js";
import GroupRoute from "./routes/Group.routes.js";
import MeetingRoute from "./routes/Meeting.routes.js";
import CalendarRoute from "./routes/Calendar.routes.js";
import NotificationRoute from "./routes/Notification.routes.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json({ message: "MASAEN API is running" });
});

app.use("/api/v1/users", UserRoute);
app.use("/api/v1/auths", AuthRoute);
app.use("/api/v1/groups", GroupRoute);
app.use("/api/v1/meetings", MeetingRoute);
app.use("/api/v1/calendars", CalendarRoute);
app.use("/api/v1/notifications", NotificationRoute);

app.listen(PORT, () => {
  console.log(`App available on http://localhost:${PORT}`);
});