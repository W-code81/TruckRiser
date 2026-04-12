const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const { csrfProtection } = require("../middleware/middleware");
const crypto = require("crypto");


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
.get( (req, res) => {
  // res.send("Forgot password page - under construction");
  res.render("forgot-password")
})

.post( async (req, res) => {
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
    const resetLink = `http://localhost:3000/reset-password/${rawToken}`;
    console.log("RESET LINK:", resetLink);

    req.flash("success", "Reset link sent (check console for now)");
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/forgot-password");
  }
});


module.exports = router;