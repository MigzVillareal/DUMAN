import express from "express"
import dotenv from "dotenv"
import path from "path"
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