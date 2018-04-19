var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

router.get("/search", isLoggedIn, function(req, res) {
    var searchType=req.query.searchType;
    var searchContent=req.query.seachContent;
    if (searchType==="requests") {
    	Request.find({$text: {$search: searchContent}} , function(err, allRequests){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {requests: allRequests} );
            }
    });
    }else if (searchType==="offers"){
    	Offer.find({$text: {$search: searchContent}} , function(err, allOffers){
        	if(err){
            	console.log(err);
        	} else {
            	res.render("offersSearch", {offers: allOffers} );
        	}
    });
    }else{
    	res.render("home");
    }
});





function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;