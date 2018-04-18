var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Index routes:

// Landing page
router.get("/", isLoggedOut, function(req, res){
    res.render("landing");
});

// Home page
router.get("/home", isLoggedIn, function(req, res){
    res.render("home");
});

// *** Authentication Routes ***

// Register
router.get("/register", isLoggedOut, function(req, res){
    res.render("register");
});

router.post("/register", isLoggedOut, function(req, res) {
    var newUser = new User({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, ipAddress: req.connection.remoteAddress});
    User.register(newUser, req.body.password, function(err, user) {
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/home")
        });
    });
});

// Login
router.get("/login", isLoggedOut, function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {successRedirect: "/home", failureRedirect: "/login"}), 
    function(req, res) {
});

// Logout
router.get("/logout", isLoggedIn, function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function isLoggedOut(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect("/home");
    } else {
        return next();
    }
}

module.exports = router;