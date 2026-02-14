const e = require("connect-flash");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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

app.get("/", (req, res) => {
  res.redirect("/signup");
});

app.get("/home", (req, res) => { //make protected 
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
      const registeredUser = await User.findOne({ email: email });

      if (!registeredUser) {
       return res.status(401).send("User not found");
      }

      const match = await bcrypt.compare(password, registeredUser.password);

      if (match) {
        res.redirect("/home");
      } else {
        res.status(401).send("Invalid password");
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
        res.status(400).send("Please Specify credentials"); // bad request, a flash will be here tho
        return;
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await User.create({
        email: email,
        password: hashedPassword,
      });

      res.redirect("/home");
    } catch (err) {
      if (err.code === 11000) {
        res.status(500).send("User already registered");
        return res.redirect("/signup");
      }
      res.status(500).send("Sign up error");
      console.error("sign up error: ", err);
    }
  });

app.get("/logout", (req, res) => { 

});

app.listen(port, () => {
  console.log(`truck app is live at port ${port}`);
});
