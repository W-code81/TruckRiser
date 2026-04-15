const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const { csrfProtection } = require("../middleware/middleware");
const crypto = require("crypto");
const transporter = require("../lib/mailer")


//LOGIN ROUTES
router
  .route("/login")
  .get(csrfProtection, (req, res) => {
    res.render("login", { currentPage: "login" , csrfToken: req.csrfToken() });
  })
  .post(
    csrfProtection,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    (req, res) => {
      req.flash("success", "Login successful");
      res.redirect("/home");
    },
  );
// what if the a user tries to login with an email that is not registered? the failureFlash should handle that and show an error message, but we can also add a check before authentication to provide a more specific error message if the email is not found in the database. This would involve querying the User model to see if the email exists before calling passport.authenticate. If the email doesn't exist, we can flash a specific error message like "Email not registered" and redirect back to the login page without attempting authentication. This would enhance the user experience by providing clearer feedback on why the login failed.


// SIGNUP ROUTES
router
  .route("/signup")
  .get(csrfProtection, (req, res) => {
    res.render("signup", { currentPage: "signup" , csrfToken: req.csrfToken() });
  })

  .post(csrfProtection, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "Please specify credentials");
        return res.redirect("/signup");
      }

      await User.register({ email: email }, password);

      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Successfully signed up");
        res.redirect("/home");
      });
    } catch (err) {
      console.error("sign up error:", err);

      // Handle duplicate key error or user already exists
      if (
        err.code === 11000 ||
        err.message.includes("already exists") ||
        err.message.includes("already registered")
      ) {
        req.flash("error", "User already registered");
      }
      // Handle validation errors
      else if (err.message && err.message.includes("Email")) {
        req.flash("error", err.message);
      }
      // Generic error
      else {
        req.flash("error", "Sign up failed. Please try again.");
      }

      return res.redirect("/signup");
    }
  });


// LOGOUT ROUTE
  router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      req.flash("error", "Logout failed");
      return res.redirect("/home");
    }
    req.flash("success", "Logout successful");
    res.redirect("/login");
  });
});

// FORGOT PASSWORD ROUTE
router
.route("/forgot-password")
.get(csrfProtection, (req, res) => {
  // res.send("Forgot password page - under construction");
  res.render("forgot-password", { currentPage: "forgot-password", csrfToken: req.csrfToken() });
})

.post(csrfProtection, async (req, res) => {
  try {
    const { email } = req.body; //user claims their identity

    const user = await User.findOne({ email }); //check if the user exists

    
    if (!user) {
      req.flash("success", "If an account exists, a reset link was sent."); //never respond if an account exist to prevent ennumeration attack
      return res.redirect("/login");
    }

   
    const rawToken = crypto.randomBytes(32).toString("hex"); // generate secure random token

    
    const hashedToken = crypto // hash token
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // store in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 mins

    await user.save();

    // send link (logging for now ) later nodemailer
    const resetLink = `${process.env.LOCAL_URL}/reset-password/${rawToken}`;
    console.log("RESET LINK:", resetLink);

    req.flash("success", "Reset link sent (check console for now)");
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/forgot-password");
  }
});

//RESET PASSWORD GET PAGE
router.get("/reset-password/:token", csrfProtection, async (req, res) => {
  try {
    //hash the token from the URL to compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    //looks up the user with the hashed token and checks if it's not expired (greater than now)
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired token");
      return res.redirect("/forgot-password");
    }

    //render reset password form with token in the URL (hidden field)
    res.render("reset-password", { currentPage: "reset-password", token: req.params.token, csrfToken: req.csrfToken() }); // pass raw token to the form

  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});

//RESET PASSWORD ROUTE
router.post("/reset-password/:token", csrfProtection, async (req, res) => {
  try {
    //get new password from form
    const { password } = req.body;

    //validate password (at least 8 chars)
    if (!password || password.length < 8) {
      req.flash("error", "Password must be at least 8 characters");
      return res.redirect(`/reset-password/${req.params.token}`); // redirect back to the form with the same token
    }

    //hash the token from the URL to compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    //looks up the user with the hashed token and checks if it's not expired (greater than now)
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Token expired or invalid");
      return res.redirect("/forgot-password");
    }

    // set new password using passport-local-mongoose method which will hash it and save the user
    await user.setPassword(password); // this will hash the password and save the user

    // remove token (one-time use)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    req.flash("success", "Password reset successful. Please login.");
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Reset failed");
    res.redirect("/forgot-password");
  }
});

module.exports = router;