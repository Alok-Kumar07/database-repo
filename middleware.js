const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/₹{id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/₹{id}`);
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if(!req.isAuthenticated() || req.user.role !== "admin"){
        req.flash("error","You must be an admin to do that");
        return res.redirect("/listings");
    }
    next();
}

module.exports.isOwnerOrAdmin = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    const isOwner = listing.owner._id.equals(res.locals.currUser._id);
    const isAdmin = req.user && req.user.role === "admin";
    if(!isOwner && !isAdmin){
        req.flash("error","You don't have permission to do that");
        return res.redirect(`/listings/₹{id}`);
    }
    next();
}
