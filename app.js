if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}
console.log(process.env.TEST);

const express=require("express");
const app = express()
const mongoose=require("mongoose");
const path = require("path");
const methodOverride=require("method-override");
const ejsMmate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session =require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport"); 
const LocalStrategy=require("passport-local");
const User=require("./models/user.js"); 

const listingsRouter=require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter= require("./routes/user.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
mongoose.connect(dbUrl)
  .then(() => console.log("connected to db"))
  .catch(err => console.log(err));


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMmate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
    
});
store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    },
};
 

// app.get("/",(req,res)=>{
//     res.send("Hi its the HomePage");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser = req.user;
     res.locals.req = req; 
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"demo@gmail.com",
//         username:"remo-user",
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);

// });

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);



// Catch-all for unmatched routes
app.use((req,res,next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err,req,res,next)=>{
    let{statusCode=500,message="somerhing went Wrong!"}=err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs",{err});
});


app.listen(8080,()=>{
    console.log("server is listening 8080");
});

