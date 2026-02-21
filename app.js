const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const validator = require("validator");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose").default;
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoose = require("mongoose");

// MIDDLEWARES AND INITIALIZATIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//HELMET MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], //only allow resources from the same origin
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], //allows scripts from the same origin and jsdelivr for flash messages, consider using nonces or hashes for better security
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"], //allows inline styles for flash messages, consider using nonces or hashes for better security
      },
    },
  }),
);

// RATE LIMITER MIDDLEWARE
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

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

// MONGODB INITIALIZATION AND SCHEMA
mongoose
  .connect(process.env.MONGO_LOCAL_URI)
  .then(() => console.log("Connected to MongoDB"))
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

app.get("/home", (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.render("index");
    }

    req.flash("error", "Please login to view page");
    res.redirect("/login");
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

app
  .route("/signup")
  .get((req, res) => {
    res.render("signup", { currentPage: "signup" });
  })

  .post(async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email, password);

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
      if (err.code === 11000 || err.message.includes("already exists") || err.message.includes("already registered")) {
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

app.get("/forgot-password", (req, res) => {});

app.post("/accept-cookies", (req, res) => {
  res.cookie("cookieConsent", "true", {
    httpOnly: false, //allows client side js to access the cookie since we need to check cookie consent in the frontend
    maxAge: 1000 * 60 * 60 * 24, //expires after a day
  });

  res.sendStatus(200);
});

app.get("/pricing", (req, res) => {
  res.render("pricing", { currentPage: "pricing" });
});

app.listen(port, () => {
  console.log(`truck app is live at port ${port}`);
});
