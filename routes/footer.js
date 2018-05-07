var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

router.get("/info/about", isLoggedIn, function(req, res) {
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render("about", {user: user} );
            }
        });
    });
	
router.get("/info/help", isLoggedIn, function(req, res) {
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render("help", {user: user} );
            }
        });
    });
	
router.get("/info/terms", isLoggedIn, function(req, res) {
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render("terms", {user: user} );
            }
        });
    });
	
router.get("/info/feedback", isLoggedIn, function(req, res) {
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render("feedback", {user: user} );
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