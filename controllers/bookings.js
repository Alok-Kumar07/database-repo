const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.renderBookingForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("bookings/new.ejs", { listing });
};

module.exports.createBooking = async (req, res, next) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        console.log("Booking request body:", req.body);
        
        // Validate booking data
        const { checkIn, checkOut, guests, specialRequests } = req.body.booking || {};
        
        console.log("Parsed booking data:", { checkIn, checkOut, guests, specialRequests });
        
        if (!checkIn || !checkOut || !guests) {
            req.flash("error", "Please fill in all required fields");
            return res.redirect(`/listings/₹{id}/book`);
        }

        // Calculate total price
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) {
            req.flash("error", "Check-out date must be after check-in date");
            return res.redirect(`/listings/₹{id}/book`);
        }

        const totalPrice = nights * listing.price;

        console.log("Creating booking:", {
            listing: listing._id,
            user: req.user._id,
            userUsername: req.user.username,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: parseInt(guests),
            totalPrice: totalPrice,
            specialRequests: specialRequests || ""
        });

        // Debug: Check if req.user._id is valid
        console.log("req.user:", req.user);
        console.log("req.user._id type:", typeof req.user._id);
        console.log("req.user._id value:", req.user._id);

        if (!req.user || !req.user._id) {
            console.error("User not authenticated or user ID missing");
            req.flash("error", "User authentication error. Please log in again.");
            return res.redirect("/login");
        }

        const newBooking = new Booking({
            listing: listing._id,
            user: req.user._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: parseInt(guests),
            totalPrice: totalPrice,
            specialRequests: specialRequests || ""
        });

        await newBooking.save();
        console.log("Booking saved successfully:", newBooking._id);
        req.flash("success", "Booking created successfully! Your booking is pending confirmation.");
        res.redirect(`/bookings/₹{newBooking._id}`);
    } catch (error) {
        console.error("Booking creation error:", error);
        req.flash("error", "Failed to create booking. Please try again.");
        res.redirect(`/listings/₹{req.params.id}/book`);
    }
};

module.exports.showBooking = async (req, res) => {
    let { id } = req.params;
    const booking = await Booking.findById(id)
        .populate("listing")
        .populate("user");
    
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/listings");
    }

    // Check if user is authorized to view this booking
    if (!req.user || (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
        req.flash("error", "You don't have permission to view this booking");
        return res.redirect("/listings");
    }

    res.render("bookings/show.ejs", { booking });
};

module.exports.userBookings = async (req, res) => {
    try {
        console.log("Fetching bookings for user:", req.user._id);
        console.log("User username:", req.user.username);
        console.log("User authenticated:", !!req.user);
        
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });
        
        console.log("Found bookings:", bookings.length);
        console.log("Bookings data:", bookings);
        
        // Check if any bookings exist for this user
        const allBookings = await Booking.find({});
        console.log("Total bookings in database:", allBookings.length);
        
        res.render("bookings/user-bookings.ejs", { bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        req.flash("error", "Failed to fetch bookings");
        res.redirect("/listings");
    }
};

module.exports.adminBookings = async (req, res) => {
    try {
        console.log("Fetching all bookings for admin");
        const bookings = await Booking.find({})
            .populate("listing")
            .populate("user")
            .sort({ createdAt: -1 });
        
        console.log("Found total bookings:", bookings.length);
        console.log("Bookings data:", bookings);
        
        const pendingBookings = bookings.filter(b => b.status === "pending");
        const confirmedBookings = bookings.filter(b => b.status === "confirmed");
        const totalRevenue = bookings
            .filter(b => b.paymentStatus === "paid")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        console.log("Pending bookings:", pendingBookings.length);
        console.log("Confirmed bookings:", confirmedBookings.length);
        console.log("Total revenue:", totalRevenue);

        res.render("admin/bookings.ejs", { 
            bookings, 
            pendingBookings, 
            confirmedBookings, 
            totalRevenue 
        });
    } catch (error) {
        console.error("Error fetching admin bookings:", error);
        req.flash("error", "Failed to fetch bookings");
        res.redirect("/listings");
    }
};

module.exports.updateBookingStatus = async (req, res) => {
    let { id } = req.params;
    let { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
        id, 
        { status: status, updatedAt: Date.now() },
        { new: true }
    );

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/admin/bookings");
    }

    req.flash("success", `Booking status updated to ₹{status}`);
    res.redirect("/admin/bookings");
};

module.exports.cancelBooking = async (req, res) => {
    let { id } = req.params;
    
    const booking = await Booking.findByIdAndUpdate(
        id, 
        { status: "cancelled", updatedAt: Date.now() },
        { new: true }
    );

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings/user");
    }

    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings/user");
};
