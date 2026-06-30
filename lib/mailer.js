const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {  
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS exists:",
  process.env.EMAIL_PASS ? "Yes" : "No"
);

try {
  await transporter.verify();
  console.log("SMTP connection successful");
} catch (err) {
  console.error("SMTP verify failed:", err);
}

module.exports=transporter;