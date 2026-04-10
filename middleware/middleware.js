const csrf = require("@dr.pogodin/csurf");

const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // CSRF cookie can't be accessed via JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
});

// Global custom authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please login to view page");
  res.redirect("/login");
}

function setCookieConsent(req, res, next) {
  res.locals.cookieConsent = req.cookies.cookieConsent; //global variable for accessing cookies
  next();
}

function setFlashMessages(req, res, next) {
  res.locals.success = req.flash("success") || []; // global success variable - ensure it's always an array
  res.locals.error = req.flash("error") || []; // global error variable - ensure it's always an array
  next();
};

// Show cookie banner only on the index (/home) after authentication
function setShowCookieBanner(req, res, next) {
  try {
    res.locals.showCookieBanner = req.path === "/home" && req.isAuthenticated();
  } catch (e) {
    res.locals.showCookieBanner = false;
  }
  next();
};

module.exports = {
  csrfProtection, 
  ensureAuthenticated,
  setCookieConsent,
  setFlashMessages,
  setShowCookieBanner
};