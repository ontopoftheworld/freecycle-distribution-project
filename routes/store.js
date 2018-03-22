var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Store routes:

router.get("/store", isLoggedIn, function(req, res) {
    res.render("store");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;