const User = require("../models/user.js");

module.exports.signup = async(req, res, next) => {
    try {
        let { username, email, password, role } = req.body;
        // Only allow 'admin' or 'user' roles
        const assignedRole = (role === 'admin') ? 'admin' : 'user';
        const newUser = new User({ email, username, role: assignedRole });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to Wander, ₹{username}! You are registered as ₹{assignedRole}.`);
            res.redirect("/listings");
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
}

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req, res) => {
    const role = req.user.role;
    req.flash("success", `Welcome back, ₹{req.user.username}! ₹{role === 'admin' ? '⚡ You are logged in as Admin.' : ''}`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully. See you soon!");
        res.redirect("/listings");
    });
}
