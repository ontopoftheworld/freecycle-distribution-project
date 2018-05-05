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
        } if (!foundUser) {
            res.redirect("back");
        } else {
            res.render("userprofile", {user: foundUser});
        }
    });
});

router.post("/users/:id/adjusthours", isLoggedIn, function(req, res) {
    if (req.user.isAdmin) {
        User.findById(req.params.id, function(err, foundUser) {
            if(err) {
                console.log(err);
            } else if (!foundUser) {
                req.flash("error", "User not found");
                res.redirect("back");
            } else {
                var adjust = parseInt(req.body.adjustedhours);
                var userhours = foundUser.userHours;
                if(isNaN(adjust)){
                    req.flash("error", "Invalid input");
                    res.redirect("back");
                } else if (adjust + userhours < 0) {
                    req.flash("error", "Adjustment error - negative balance not possible");
                    res.redirect("back");
                } else {
                    foundUser.userHours = adjust + userhours;
                    foundUser.save();
                    req.flash("success", "Successfully adjusted user hours");
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
});

router.post("/users/:id/admin", isLoggedIn, function(req, res) {
    if (req.user.isAdmin) {
        User.findById(req.params.id, function(err, foundUser) {
            if(err) {
                console.log(err);
            } else if (!foundUser) {
                req.flash("error", "User not found");
                res.redirect("back");
            } else {
                var bool = foundUser.isSAdmin;
                console.log(bool);
                foundUser.isSAdmin = !bool;
                foundUser.save();
                req.flash("Success", "User's Admin status was successfully changed");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You do not have permission to do that");
        res.redirect("back");
    }
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;