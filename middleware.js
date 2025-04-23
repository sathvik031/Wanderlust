const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema} = require("./schema");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //only if user is not logged in save redirect url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${ id }`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    if(!req.body){
        throw new ExpressError(400, "Bad request");
    }
    let { error } = listingSchema.validate(req.body);
        
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else {
            next();
        }
};

module.exports.validateReview = (req, res, next) => {
    // if(!req.body){
    //     throw new ExpressError(400, "Bad request");
    // }
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log(error);
        let errMsg = error.details.map((el) => el.message).join(',');
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${ id }`);
    }
    next();
};