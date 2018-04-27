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

    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }
    
    module.exports = router;
