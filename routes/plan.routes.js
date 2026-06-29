// routes/plan.routes.js
const express = require("express");
const router = express.Router();
const { createPlan, getPlans, addWebhook } = require("../controllers/planController");
const { initializeTrans, verifyTrans } = require("../controllers/userController");

router.get("/getPlans", getPlans);
router.post("/createPlan", createPlan);
router.post("/webhook", addWebhook);

router.post("/initiate-transaction/:id", initializeTrans);
router.get("/verify-transaction/:id", verifyTrans);

module.exports = router;