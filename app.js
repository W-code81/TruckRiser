require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1); // trust first proxy for secure cookies behind proxies/load balancers
const port = process.env.PORT || 3000;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const crypto = require("crypto");
const connectDB = require("./config/db");
const passport = require("passport");
const initPassport = require("./config/passport.config");
const {
  csrfProtection,
  ensureAuthenticated,
  setCookieConsent,
  setFlashMessages,
  setShowCookieBanner,
} = require("./middleware/middleware");
const authRoutes = require("./routes/auth.routes");
const homeRoutes = require("./routes/home.routes");
const generalRoutes = require("./routes/general.routes");


// MIDDLEWARES AND INITIALIZATIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"));



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
app.use(setCookieConsent) //global variable for accessing cookies in templates and routes

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
      sameSite: "Strict", //prevents CSRF by only sending cookies for same site requests
    },
  }),
);

// PASSPORT INITIALIZATION AND SESSIONS
app.use(passport.initialize());
app.use(passport.session()); //persists sessions

initPassport(); //configures passport strategies and serialization


// FLASH
app.use(flash());
app.use(setFlashMessages);
app.use(setShowCookieBanner); //middleware to determine when to show cookie banner, only on home page after authentication


// DATABASE CONNECTION
connectDB();

// API ROUTES AND BUSINESS LOGIC
app.use(generalRoutes);
app.use(homeRoutes);
app.use(authRoutes);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Invalid or expired form token. Please try again.");
    return res.redirect("/login");
  }
  next(err);
});

app.listen(port, () => {
  console.log(`truck app is live at port ${port}`);
});
