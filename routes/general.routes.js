const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/signup");
});

router.post("/accept-cookies", (req, res) => {
  const level = req.body.level || "necessary";
  res.cookie("cookieConsent", level, {
    httpOnly: false, //allows client side js to access the cookie since we need to check cookie consent in the frontend
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, //expires after a day
  });
  res.sendStatus(200);
});

router.get("/privacy", (req, res) => {
  res.render("privacy", { currentPage: "privacy" });
});

router.get("/terms", (req, res) => {
  res.render("terms", { currentPage: "privacy" });
});

router.get("/pricing", (req, res) => {
  res.status(200).send("coming soon");
});

router.get("/rent", (req, res) => {
  res.status(200).send("coming soon");
});

module.exports = router;