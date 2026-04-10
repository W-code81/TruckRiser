const express = require("express");
const router = express.Router();
const _ = require("lodash");
const validator = require("validator");
const transporter = require("../lib/mailer");
const { csrfProtection, ensureAuthenticated } = require("../middleware/middleware");


// HOME ROUTE
router
.route("/home")
.get( ensureAuthenticated, csrfProtection, (req, res) => {
  try {
    res.render("index",{ csrfToken: req.csrfToken() });
  } catch (err) {
    console.error("Error in /home route:", err);
    res.redirect("/");
  }
})

// nodemailer contact route
.post(csrfProtection, async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  const trimmedEmail = _.trim(email);
  const trimmedMessage = _.trim(message);

  if (!firstName || !lastName || !email || !message) {
    res.locals.error = ["All fields are required"]; //sending message as locals removes flash redirect concern , renders directly to the page  
    return res.render("index", { csrfToken: req.csrfToken() });
  }

  if (!validator.isEmail(trimmedEmail)) {
    res.locals.error = ["Invalid email address"];
    return res.render("index", { csrfToken: req.csrfToken() });
  }

  try {
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: trimmedEmail,
      subject: `New message from ${firstName} ${lastName}`,
      text: trimmedMessage,
      html: `
        <p><strong>Name: </strong>${firstName} ${lastName}</p>
        <p><strong>Email: </strong>${trimmedEmail}</p>
        <p><strong>Message: </strong>${trimmedMessage}</p>
      `,
    });
    res.locals.success = ["Message sent successfully"];
    res.render("index", { csrfToken: req.csrfToken() });
  } catch (err) {
    console.error("Error sending contact email:", err);
    res.locals.error = ["Message failed to send. Please try again later."];
    res.render("index", { csrfToken: req.csrfToken() });
  }
})

module.exports = router;