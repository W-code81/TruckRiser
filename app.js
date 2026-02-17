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
const mongoose = require("mongoose");


// MIDDLEWARES AND INITIALIZATIONS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


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
  res.locals.success = req.flash("success"); // global success variable
  res.locals.error = req.flash("error"); // global error variable
  next();
});


// COOKIEPARSER
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.cookieConsent = req.cookies.cookieConsent; //global variable for accessing cookies
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
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(passportLocalMongoose, {usernameField: "email"}) //uses local auth strategies (hash,salt,auth middleware)
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
  if (req.isAuthenticated()){
    res.render("index");
  }

  req.flash("error", "Please login to view page");
  
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),(req, res) =>{
    req.flash("success" , "Login successful");
    res.redirect("/home");
  }
);
   
app
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })

  .post(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return req.flash("error", "please specify credentials"); //check this 
      }

      await User.register({email: email} , password);

      passport.authenticate("local")(req, res , () =>{
        req.flash("success", "successfully signed in");
        res.redirect("/home");
      });
      

    } catch (err) {
      if (err.code === 11000) {
        req.flash("error", "User already registered");
        return res.redirect("/signup");
      }
      req.flash("error", "sign up error");
      return res.redirect("/signup");
    }
  });

app.get("/logout", (req, res) => {});

app.post("/accept-cookies", (req, res) => {
  (res.cookie("cookieConsent", "true"),
    {
      httpOnly: false, //allows client side js to access the cookie since we need to check cookie consent in the frontend
      maxAge: 1000 * 60 * 60 * 24, //expires after a day
    });
  res.status(200);
});

app.listen(port, () => {
  console.log(`truck app is live at port ${port}`);
});
