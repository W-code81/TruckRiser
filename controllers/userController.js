// controllers/userController.js
const User = require("../models/User");
const paystack = require("paystack-api")(process.env.PAYSTACK_TEST_API_KEY);

const initializeTrans = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, plan } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!plan) return res.status(400).json({ message: "Plan is required" });

    // validate plan on backend — never trust frontend amount
    const plansResponse = await paystack.plan.list();
    const validPlan = plansResponse.data.find(p => p.plan_code === plan);

    if (!validPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const verifiedAmount = validPlan.amount; // use Paystack's amount, not frontend's

    const response = await paystack.transaction.initialize({
      email,
      amount: verifiedAmount,
      plan,
      callback_url: `${process.env.LOCAL_URL}/paystack/payment/callback`,
    });

    await User.findByIdAndUpdate(id, {
      paystack_ref: response.data.reference,
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

const verifyTrans = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.paystack_ref === "success") {
            return res.status(200).json({
                data: {},
                message: "Transaction already verified",
                status: 1,
            });
        }

        const response = await paystack.transaction.verify({
            reference: user.paystack_ref,
        });

        if (response.data.status === "success") {
            await User.findByIdAndUpdate(id, {
                paystack_ref: response.data.status,
                amountDonated: response.data.amount,
            });

            return res.status(200).json({
                data: response.data,
                message: response.message,
                status: response.status,
            });
        } else {
            return res.status(400).json({
                data: response.data,
                message: response.message,
                status: response.status,
            });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const handleCallback = async (req, res) => {
        try {
            const { reference } = req.query;

            if (!reference) {
                req.flash("error", "Payment reference missing");
                return res.redirect("/pricing");
            }

            const response = await paystack.transaction.verify({ reference });

            if (response.data.status === "success") {
                req.flash("success", "Subscription activated successfully. Welcome aboard!");
                return res.redirect("/home");
            } else {
                req.flash("error", "Payment could not be verified. Please try again.");
                return res.redirect("/pricing");
            }

        } catch (error) {
            console.error("Callback error:", error.message);
            req.flash("error", "Something went wrong. Please contact support.");
            res.redirect("/pricing");
        }
    };

module.exports = { initializeTrans, verifyTrans, handleCallback };