import "./config.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import UserRoute from "./routes/User.routes.js";
import AuthRoute from "./routes/Auth.routes.js";
import GroupRoute from "./routes/Group.routes.js";
import MeetingRoute from "./routes/Meeting.routes.js";
import CalendarRoute from "./routes/Calendar.routes.js";
import NotificationRoute from "./routes/Notification.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  const filePath = path.join(__dirname, "..", "frontend", "home.html");
  res.send(await readFile(filePath, "utf8"));
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