const Listing = require("../models/listings.js")


module.exports.index = async (req, res) => {
  const { category } = req.query; // get category from query string
  let query = {};

  if (category) {
    query.category = category; // exact match with Mongoose enum
  }

  const allListings = await Listing.find(query).sort({ _id: -1 });
  res.render("listings/index.ejs", { allListings, selectedCategory: category || "" });
};


module.exports.renderNewForm=(req,res)=>{    
   res.render("listings/new.ejs");
    };

module.exports.showListing= async(req,res)=>{
    let {id} = req.params;
    const listing= await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner"); 
    if (!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");    
    }
        res.render("listings/show.ejs",{listing}) ; 
    };


module.exports.createListing= async(req,res,next) =>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    };

module.exports.renderEditForm= async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if (!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");    
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
   let{id}=req.params;
   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if (typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename= req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
   req.flash("success","Listing Updated Successfully!")
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing= async(req,res)=>{
    let{id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
};

// module.exports.search = async (req, res) => {
//   let input = req.query.q?.trim().replace(/\s+/g, " ") || "";

//   if (!input) {
//     req.flash("error", "Search value empty!!!");
//     return res.redirect("/listings");
//   }

//   // Check if input is number for price search
//   const intValue = parseInt(input, 10);

//   let query = {
//     $or: [
//       { title: { $regex: input, $options: "i" } },
//       { category: { $regex: input, $options: "i" } },
//       { country: { $regex: input, $options: "i" } },
//       { location: { $regex: input, $options: "i" } }
//     ]
//   };

//   // If input is a number, also include price search
//   if (!isNaN(intValue)) {
//     query.$or.push({ price: { $lte: intValue } });
//   }

//   let allListings = await Listing.find(query).sort({ _id: -1 });

//   if (allListings.length > 0) {
//     res.locals.success = `Search results for "${input}"`;
//     return res.render("listings/index.ejs", { allListings, q: input });
//   }

//   req.flash("error", "No listings found!");
//   return res.redirect("/listings");
// };
module.exports.search = async (req, res) => {
  let input = req.query.q?.trim().replace(/\s+/g, " ") || "";

  if (!input) {
    req.flash("error", "Search value empty!!!");
    return res.redirect("/listings");
  }

  const intValue = parseInt(input, 10);

  let query = {
    $or: [
      { title: { $regex: input, $options: "i" } },
      { category: { $regex: input, $options: "i" } },
      { country: { $regex: input, $options: "i" } },
      { location: { $regex: input, $options: "i" } }
    ]
  };

  if (!isNaN(intValue)) {
    query.$or.push({ price: { $lte: intValue } });
  }

  let allListings = await Listing.find(query).sort({ _id: -1 });

  if (allListings.length > 0) {
    res.locals.success = `Search results for "${input}"`;
    return res.render("listings/index.ejs", { allListings, selectedCategory: null, q: input });
  }

  req.flash("error", "No listings found!");
  return res.redirect("/listings");
};
