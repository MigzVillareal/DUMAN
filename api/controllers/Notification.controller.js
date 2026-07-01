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

const mailSelf = "duman.masarean@gmail.com";
const mailDevs = "jjcleofe@gbox.adnu.edu.ph, jmvillareal@gbox.adnu.edu.ph";
const mailTo = "";
const mailSubject = "Empty Subject";
const mailText = "Empty Text";

try {
  const info = await transporter.sendMail({
    from: '"DUMAN" <duman.masarean@gmail.com>',
    to: `${mailSelf}, ${mailDevs}, ${mailTo}`,
    subject: mailSubject,
    text: mailText,
  });

  console.log("Message sent: %s", info.messageId);
} catch (err) {
  console.error("Error while sending mail:", err);
}