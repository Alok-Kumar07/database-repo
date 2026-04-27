const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const userConroller = require("../controllers/users.js")

router.get("/signup", userConroller.renderSignupForm);

router.post("/signup", wrapAsync(userConroller.signup))

router.get("/login", userConroller.renderLoginForm)

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  userConroller.login
);

router.get("/logout", userConroller.logout);

module.exports = router;