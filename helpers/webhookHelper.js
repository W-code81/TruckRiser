// helpers/webhookHelper.js
const User = require("../models/User");
const paystack = require("paystack-api")(process.env.PAYSTACK_TEST_API_KEY);

const chargeSuccess = async (data) => {
  try {
    const output = data.data;
    const reference = output.reference;

    const user = await User.findOne({ paystack_ref: reference });
    if (!user) return console.log("User not found for reference:", reference);

    if (user.paystack_ref === "success")
      return console.log("Transaction already verified");

    const response = await paystack.transaction.verify({
      reference: user.paystack_ref,
    });

    if (response.data.status === "success") {
      await User.findByIdAndUpdate(user._id, {
        paystack_ref: response.data.status,
        amountDonated: output.amount,
      });
      console.log("Charge successful");
    } else {
      console.log("Charge unsuccessful");
    }

  } catch (error) {
    console.error("chargeSuccess error:", error.message);
  }
};

const planChargeSuccess = async (data) => {
  try {
    const output = data.data;
    const reference = output.reference;

    const user = await User.findOne({ paystack_ref: reference });
    if (!user) return console.log("User not found for reference:", reference);

    if (user.paystack_ref === "success")
      return console.log("Transaction already verified");

    const response = await paystack.transaction.verify({
      reference: user.paystack_ref,
    });

    if (response.data.status === "success") {
      await User.findByIdAndUpdate(user._id, {
        isSubscribed: true,
        paystack_ref: response.data.status,
        planName: output.plan.name,
        timeSubscribed: response.data.paid_at,
      });
      console.log("Plan charge successful");
    } else {
      console.log("Plan charge unsuccessful");
    }

  } catch (error) {
    console.error("planChargeSuccess error:", error.message);
  }
};

const cancelSubscription = async (data) => {
  try {
    const output = data.data;
    const reference = output.reference;

    const user = await User.findOne({ paystack_ref: reference });
    if (!user) return console.log("User not found for reference:", reference);

    await User.findByIdAndUpdate(user._id, {
      isSubscribed: false,
      paystack_ref: "cancelled",
      planName: "cancelled",
    });
    console.log("Subscription cancelled");

  } catch (error) {
    console.error("cancelSubscription error:", error.message);
  }
};

module.exports = { chargeSuccess, planChargeSuccess, cancelSubscription };