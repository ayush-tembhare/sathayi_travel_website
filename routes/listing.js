const express=require("express");
const router=express.Router();
const Listing = require('../models/listings.js');
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const { renderNewForm } = require("../controllers/listings.js");
const multer=require('multer');
const { storage } = require("../cloudConfig.js"); // destructure storage
const upload= multer({storage});

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );
  
// New Listing Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Search
router.get("/search", wrapAsync(listingController.search));

// Show + Update + Delete
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

// Edit Form
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
