const passport = require("passport");
const User = require("../models/User");


// PASSPORT LOCAL STRATEGY CONFIGURATION
const initPassport = () => {
  passport.use(User.createStrategy()); //local strategy
  passport.serializeUser(User.serializeUser()); //creates cookies
  passport.deserializeUser(User.deserializeUser()); //retrieves cookie info
};

module.exports = initPassport;