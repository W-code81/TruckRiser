require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1); // trust first proxy for secure cookies behind proxies/load balancers
const port = process.env.PORT || 3000;
const validator = require("validator");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose").default;
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const nodemailer = require("nodemailer");
const transporter = require("./lib/mailer");
const _ = require("lodash");
const mongoose = require("mongoose");

// MIDDLEWARES AND INITIALIZATIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"));

// Global custom authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please login to view page");
  res.redirect("/login");
}

//HELMET MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], //only allow resources from the same origin
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com"], //allows scripts from the same origin and jsdelivr for flash messages, consider using nonces or hashes for better security
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ], //allows inline styles for flash messages, consider using nonces or hashes for better security
        imgSrc: ["'self'", "https://images.unsplash.com"], //allows images from the same origin and Unsplash
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"], //allows AJAX requests to the same origin and jsdelivr for flash messages, consider using nonces or hashes for better security
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"], //allows fonts from the same origin and cdnjs
      },
    },
  }),
);

// RATE LIMITER MIDDLEWARE
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
  skip: () => process.env.NODE_ENV === "development",
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// app.use("/login", limiter);
// app.use("/signup", limiter);

// COOKIEPARSER
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.cookieConsent = req.cookies.cookieConsent; //global variable for accessing cookies
  next();
});

// EXPRESS SESSIONS
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // doesn't save unchanged sessions
    saveUninitialized: false, // doesn't create if empty
    cookie: {
      httpOnly: true, //prevents client side js from accessing the cookie
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, //cookie expires after 1 day
    },
  }),
);

// PASSPORT INITIALIZATION AND SESSIONS
app.use(passport.initialize());
app.use(passport.session()); //persists sessions

// FLASH
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || []; // global success variable - ensure it's always an array
  res.locals.error = req.flash("error") || []; // global error variable - ensure it's always an array
  next();
});

// Show cookie banner only on the index (/home) after authentication
app.use((req, res, next) => {
  try {
    res.locals.showCookieBanner = req.path === "/home" && req.isAuthenticated();
  } catch (e) {
    res.locals.showCookieBanner = false;
  }
  next();
});

// MONGODB INITIALIZATION AND SCHEMA
mongoose
  .connect(process.env.MONGO_LOCAL_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(passportLocalMongoose, { usernameField: "email" }); //uses local auth strategies (hash,salt,auth middleware)
const User = mongoose.model("User", userSchema);

// PASSPORT LOCAL STRATEGY
passport.use(User.createStrategy()); //local strategy
passport.serializeUser(User.serializeUser()); //creates cookies
passport.deserializeUser(User.deserializeUser()); //retrieves cookie info

// API ROUTES AND BUSINESS LOGIC

app.get("/", (req, res) => {
  res.redirect("/signup");
});

app.get("/home", ensureAuthenticated, (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    console.error("Error in /home route:", err);
    res.redirect("/");
  }
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login", { currentPage: "login" });
  })
  .post(
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
app
  .route("/signup")
  .get((req, res) => {
    res.render("signup", { currentPage: "signup" });
  })

  .post(async (req, res) => {
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

app.get("/logout", (req, res) => {
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

app.get("/forgot-password", (req, res) => {
  res.send("Forgot password page - under construction");
});

// nodemailer contact route
app.post("/contact", async (req, res) =>{

    const {firstName, lastName ,email, message } = req.body;
    const trimmedEmail = _.trim(email);
    const trimmedMessage = _.trim(message);

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "All fields are required" }); // replace with flash after testing
    }

    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({ error: "Invalid email address" }); // replace with flash after testing
    }
    
    try {
       await transporter.sendMail({
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, //sends to myself
        replyTo: trimmedEmail, //reply's to sender 
        subject: `New message from ${firstName} ${lastName}`,
        text: trimmedMessage,
        html:`
        <p><strong>Name: </strong>${firstName} ${lastName}</p>
        <p><strong>Email: </strong>${trimmedEmail}</p>
        <p><strong>Message: </strong>${trimmedMessage}</p>
        `,
    });
    res.status(200).json({success:true}); // replace with flash after testing
    } catch (err) {
      console.error("Error sending contact email:", err);
      res.status(500).json({error:"Failed to submit email"}) // replace with flash after testing
    }
});

app.post("/accept-cookies", (req, res) => {
  res.cookie("cookieConsent", "true", {
    httpOnly: false, //allows client side js to access the cookie since we need to check cookie consent in the frontend
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, //expires after a day
  });

  res.sendStatus(200);
});

app.get("/pricing", (req, res) => {
  res.status(200).send("coming soon");
  // res.render("pricing", { currentPage: "pricing" });
});

app.get("/rent", (req, res) => {
  res.status(200).send("coming soon");
});

app.listen(port, () => {
  console.log(`truck app is live at port ${port}`);
});
