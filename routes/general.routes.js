const express = require("express");
const router = express.Router();
const { csrfProtection, ensureAuthenticated } = require("../middleware/middleware");

router.get("/", csrfProtection, (req, res) => {
  res.redirect("/signup");
});
  
router.post("/accept-cookies", csrfProtection, (req, res) => {
  const level = req.body.level || "necessary";
  res.cookie("cookieConsent", level, {
    httpOnly: false, //allows client side js to access the cookie since we need to check cookie consent in the frontend
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, //expires after a day
  });
  res.sendStatus(200);
});

router.get("/privacy", csrfProtection, (req, res) => {
  res.render("privacy", { currentPage: "privacy" });
});

router.get("/terms", csrfProtection, (req, res) => {
  res.render("terms", { currentPage: "privacy" });
});

router.get("/pricing", csrfProtection, (req, res) => {
  res.status(200).send("coming soon");
});

router.get("/rent", csrfProtection, (req, res) => {
  res.status(200).send("coming soon");
});

router.get("/user/profile", csrfProtection, (req, res) => {
  res.status(200).send("coming soon");
});
module.exports = router;