var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Requests routes:

router.get("/requests", isLoggedIn, function(req, res) {
    Request.find({}, function(err, allRequests){
        if(err){
            console.log(err);
        } else {
            res.render("requests", {requests: allRequests} );
        }
    });
});

router.get("/requests/new", isLoggedIn, function(req, res) {
    res.render("newrequest");
});

router.post("/requests", isLoggedIn, function(req, res) {
    Request.create(req.body.request, function(err, newR) {
        if(err){
            res.render("newrequest");
        } else {
            res.redirect("/requests");
        }
    });
});

router.get("/requests/:id", isLoggedIn, function(req, res) {
    Request.findById(req.params.id, function(err, foundRequest) {
        if(err) {
            console.log(err);
        } else {
            res.render("showrequest", {request: foundRequest});
        }
    });
});

router.get("/requests/:id/edit", isLoggedIn, function(req, res) {
    Request.findById(req.params.id, function(err, foundRequest) {
        if(err) {
            res.redirect("/requests");
        } else {
            res.render("editrequest", {request: foundRequest});
        }
    });
});

router.put("/requests/:id", isLoggedIn, function(req, res) {
    Request.findByIdAndUpdate(req.params.id, req.body.request, function(err, updatedRequest) {
        if(err){
            res.redirect("/requests");
        } else {
            res.redirect("/requests/" + req.params.id);
        }
    });
});

router.delete("/requests/:id", isLoggedIn, function(req, res) {
    Request.findByIdAndRemove(req.params.id, function(err, updatedRequest) {
        if(err){
            res.redirect("/requests")
        } else {
            res.redirect("/requests")
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