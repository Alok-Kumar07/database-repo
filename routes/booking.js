const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");
const Booking = require("../models/booking.js");

// Booking validation schema
const validateBooking = (req, res, next) => {
    try {
        console.log("Validating booking data:", req.body);
        const { checkIn, checkOut, guests } = req.body.booking || {};
        const errors = [];
        
        if (!checkIn || !checkOut) {
            errors.push("Check-in and check-out dates are required");
        }
        
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            if (checkInDate >= checkOutDate) {
                errors.push("Check-out date must be after check-in date");
            }
            
            const today = new Date();
            today.setHours(0,0,0,0);
            if (checkInDate < today) {
                errors.push("Check-in date cannot be in the past");
            }
        }
        
        if (!guests || guests < 1 || guests > 10) {
            errors.push("Number of guests must be between 1 and 10");
        }
        
        if (errors.length > 0) {
            console.log("Validation errors:", errors);
            req.flash("error", errors.join(", "));
            return res.redirect(`/listings/${req.params.id}/book`);
        }
        
        console.log("Validation passed");
        next();
    } catch (error) {
        console.error("Validation error:", error);
        req.flash("error", "Validation failed. Please check your input.");
        res.redirect(`/listings/${req.params.id}/book`);
    }
};

// New booking form
router.get("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.renderBookingForm));

// Create booking
router.post("/listings/:id/book", isLoggedIn, validateBooking, wrapAsync(bookingController.createBooking));

// User booking history — must be BEFORE /bookings/:id to avoid "user" being treated as :id
router.get("/bookings/user", isLoggedIn, wrapAsync(bookingController.userBookings));

// Debug route — must also be BEFORE /bookings/:id
router.get("/bookings/debug", isLoggedIn, async (req, res) => {
    try {
        const allBookings = await Booking.find({});
        const userBookings = await Booking.find({ user: req.user._id });
        
        res.json({
            userId: req.user._id,
            username: req.user.username,
            totalBookings: allBookings.length,
            userBookings: userBookings.length,
            allBookings: allBookings,
            userBookingsData: userBookings
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Show booking details
router.get("/bookings/:id", isLoggedIn, wrapAsync(bookingController.showBooking));

// Admin booking management
router.get("/admin/bookings", isLoggedIn, isAdmin, wrapAsync(bookingController.adminBookings));

// Update booking status (admin only)
router.post("/admin/bookings/:id/status", isLoggedIn, isAdmin, wrapAsync(bookingController.updateBookingStatus));

// Cancel booking
router.post("/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
