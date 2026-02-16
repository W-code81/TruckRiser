const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const mongoose = require("mongoose");

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

const User = mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(flash()); //flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // global success variable
  res.locals.error = req.flash("error"); // global error variable
  next();
});

app.use(cookieParser()); //cookie parser middleware
app.use((req, res, next) => {
  res.locals.cookieConsent = req.cookies.cookieConsent; //global variable for accessing cookies
  next();
});



app.get("/", (req, res) => {
  res.redirect("/signup");
});

app.get("/home", (req, res) => {
  //make protected
  res.render("index");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    try {
      const { email, password } = req.body;
      const registeredUser = await User.findOne({ email: email }); //get user by the email

      if (!registeredUser) {
        req.flash("error", "user not found");
        res.redirect("/login");

        //  return res.status(401).send("User not found");
      }

      const match = await bcrypt.compare(password, registeredUser.password);

      if (match) {
        req.flash("success", "sucecessfully login!");
        res.redirect("/home");
      } else {
        req.flash("error", "failed to login!");
        res.redirect("/login");
      }
    } catch (error) {
      res.status(500).send("Login error");
      console.error("login error: ", error);
    }
  });

app
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })

  .post(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "please specify credentials");
        // res.status(400).send("Please Specify credentials"); // bad request, a flash will be here tho
        return;
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await User.create({
        email: email,
        password: hashedPassword,
      });
      req.flash("success", "successfully signed in");
      res.redirect("/home");
    } catch (err) {
      if (err.code === 11000) {
        req.flash("error", "User already registered");
        // res.status(500).send("User already registered"); //send and redirect can't work at the same time fix this
        return res.redirect("/signup");
      }
      req.flash("error", "sign up error");
      // res.status(500).send("Sign up error");
      console.error("sign up error: ", err);
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
