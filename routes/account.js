var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");


    router.get("/account", isLoggedIn, function(req, res) {
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render("account", {user: user, userHrsHistory: user.hoursHistory} );
            }
        });
    });

	
	router.get("/account/:id/edit", isLoggedIn, function(req, res) {
		User.findById(req.user._id, function(err, user) {
			if(err) {
				console.log(err);
			} else {
     
                res.render("editaccount", {user:user});
            
			}
		});
	});
	router.put("/account", isLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.user._id, req.body.account, function(err, updatedAccount) {
        if(err){
            res.redirect("/account");
        } else {
			req.flash("success","You have successfully changed your profile")
            res.redirect("/account");
        }
    });
});
    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }
    
    module.exports = router;
