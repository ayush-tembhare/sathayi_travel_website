const mongoose = require('mongoose');
const Review = require("./reviews.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String,
        required:true,
    },
    description: String,
    image:{
        url:String,
        filename:String,
     
    } ,
  price: { type: Number, required: true, default: 0 },
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
     category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Iconic City",
      "Mountains",
      "Castles",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Arctic",
      "Boats",
      "Beach",
      "Domes",
    ],
    required: true,
  },
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
});

const Listings = mongoose.model("Listing",listingSchema);
module.exports=Listings;