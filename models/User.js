const mongoose = require("mongoose");
const validator = require("validator");
const passportLocalMongoose = require("passport-local-mongoose").default;

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
    fullname: {
      type: String,
      trim: true,
    },
    paystack_ref: {
      type: String,
    },
    amountDonated: {
      type: Number,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    planName: {
      type: String,
    },
    timeSubscribed: {
      type: Date,
    },
    resetPasswordToken: String,   // top level
    resetPasswordExpires: Date,   // top level
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(passportLocalMongoose, { usernameField: "email" }); //uses local auth strategies (hash,salt,auth middleware)

const User = mongoose.model("User", userSchema);
module.exports = User;