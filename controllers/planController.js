// controllers/planController.js
const paystack = require("paystack-api")(process.env.PAYSTACK_TEST_API_KEY);
const { cancelSubscription, planChargeSuccess, chargeSuccess } = require("../helpers/webhookHelper");

const createPlan = async (req, res) => {
  try {
    const { interval, name, amount } = req.body;

    const trimmedName = name.trim();
    const trimmedInterval = interval.trim().toLowerCase();
    const trimmedAmount = Number(amount.trim());

    if (!trimmedInterval || !trimmedName || !trimmedAmount) {
      return res.status(400).json({ error: "Please provide all required fields (interval, name, amount)" });
    }

    if (isNaN(trimmedAmount)) {
      return res.status(400).json({ error: "Amount must be a number" });
    }

    const response = await paystack.plan.create({
      name: trimmedName,
      amount: trimmedAmount,
      interval: trimmedInterval,
    });

    res.status(200).json({
      data: response.data,
      message: response.message,
      status: response.status,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const response = await paystack.plan.list();

    res.status(200).json({
      data: response.data,
      message: response.message,
      status: response.status,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addWebhook = async (req, res) => {
  try {
    // verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_TEST_API_KEY) //API key can be changed
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("Invalid webhook signature — request rejected");
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    let data = req.body;
    console.log("Webhook data:", data);

    switch (data.event) {
      case "invoice.payment_failed":
        await cancelSubscription(data);
        console.log("Invoice Failed");
        break;
      case "invoice.create":
        console.log("Invoice created");
        break;
      case "invoice.update":
        data.data.status == "success"
          ? await planChargeSuccess(data)
          : console.log("Update Failed");
        break;
      case "subscription.not_renew":
        console.log("Unrenewed");
        break;
      case "subscription.disable":
        console.log("Disabled");
        break;
      case "transfer.success":
        console.log("Transfer successful");
        break;
      case "transfer.failed":
        console.log("Transfer failed");
        break;
      case "transfer.reversed":
        console.log("Transfer reversed");
        break;
      default:
        const obj = data.data.plan;
        Object.keys(obj).length === 0 && obj.constructor === Object
          ? await chargeSuccess(data)
          : await planChargeSuccess(data);
        console.log("Charge handled successfully");
        break;
    }

    res.status(200).json({ message: "Webhook received", status: 0 });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createPlan, getPlans, addWebhook };