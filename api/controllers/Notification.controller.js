// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.join(__dirname, "../.env") });

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "duman.masarean@gmail.com",
    pass: "qydb vgqa chgh mwhc",
  },
});

try {
  const info = await transporter.sendMail({
    from: '"MASARAEN" <duman.masarean@gmail.com>',
    to: "jmvillareal@gbox.adnu.edu.ph, jjcleofe@gbox.adnu.edu.ph",
    subject: "For jmvillareal",
    text: "Please believe me dada, I am not spam mail dada... please...",
  });

  console.log("Message sent: %s", info.messageId);
} catch (err) {
  console.error("Error while sending mail:", err);
}