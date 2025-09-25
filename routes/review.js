// routes/reviews.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ mergeParams so we can access :id from parent route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listings.js");
const Review = require("../models/reviews.js");
const{validateReview, isLoggedIn,isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

// ✅ Create Review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)

);

// ✅ Delete Review
router.delete(
  "/:reviewId",
   isLoggedIn,
   isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
