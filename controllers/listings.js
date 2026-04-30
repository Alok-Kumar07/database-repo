const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const { search } = req.query;
    let query = {};
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query = { $or: [{ title: regex }, { location: regex }, { country: regex }] };
    }
    const allListing = await Listing.find(query);
    res.render("listings/index", { allListing, searchTerm: search || '' });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListings = async(req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.isVerified = false;
    await newListing.save();
    req.flash("success", "New listing created! It will appear after admin verification.");
    res.redirect("/listings");
}

module.exports.renderEditeForm = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let originalUrl = listing.image.url.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalUrl });
}

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted.");
    res.redirect("/listings");
}

module.exports.verifyListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { isVerified: true });
    req.flash("success", "Listing verified successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.unverifyListing = async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { isVerified: false });
    req.flash("success", "Listing unverified.");
    res.redirect(`/listings/${id}`);
}

module.exports.adminDashboard = async(req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    const verifiedCount = await Listing.countDocuments({ isVerified: true });
    const pendingCount = await Listing.countDocuments({ isVerified: false });
    res.render("admin/dashboard.ejs", { allListings, verifiedCount, pendingCount });
}
