import express from "express"
import dotenv from "dotenv"
import path from "path"
import UserRoute from "./routes/User.routes.js";
import AuthRoute from "./routes/Auth.routes.js";
import GroupRoute from "./routes/Group.routes.js";
import MeetingRoute from "./routes/Meeting.routes.js";
import CalednarRoute from "./routes/Calendar.routes.js";
import NotificationRoute from "./routes/Notification.routes.js";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.get('/', async (req, res) => {

    const filePath = path.join(__dirname, '..', 'frontend', 'home.html');
    response.send( await readFile(filePath, 'utf8'));

});

app.listen(PORT, () => {
    console.log(`App available on http://localhost:${PORT}`)
});

//import user routes here
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/auths", AuthRoute);
app.use("/api/v1/groups", GroupRoute);
app.use("/api/v1/meetings", MeetingRoute);
app.use("/api/v1/calendars", CalendarRoute);
app.use("/api/v1/notifications", NotificationRoute);