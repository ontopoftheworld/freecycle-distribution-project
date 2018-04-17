var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Members routes:
router.get("/users", isLoggedIn, function(req, res) {
    User.find({}, function(err, allUsers){
        if(err){
            console.log(err);
        } else {
            res.render("users", {users: allUsers} );
        }
    });
});

router.get("/users/:id", isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            res.render("userprofile", {user: foundUser});
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;