var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Offers routes:

router.get("/offers", isLoggedIn, function(req, res) {
    Offer.find({}, function(err, allOffers){
        if(err){
            console.log(err);
        } else {
            res.render("offers", {offers: allOffers} );
        }
    });
});

router.get("/offers/new", isLoggedIn, function(req, res) {
    res.render("newoffer");
});

router.post("/offers", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
        } else {
            var title = req.body.offer.title;
            var desc = req.body.offer.desc;
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var hoursOffered = req.body.offer.hoursOffered;
            var category = req.body.offer.category;
            var newOffer = {title: title, desc: desc, author: author, hoursOffered: hoursOffered, category: category};
            Offer.create(newOffer, function(err, newO) {
                if(err){
                    console.log(err);
                    res.render("newoffer");
                } else {
                    user.offers.push(newO);
                    user.save();
                    res.redirect("/offers");
                }
            });
        }
    });
});

router.get("/offers/:id", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            console.log(err);
        } else {
            res.render("showoffer", {offer: foundOffer});
        }
    });
});

router.get("/offers/:id/edit", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            res.redirect("/offers");
        } else {
            if (foundOffer.author.id.equals(req.user._id)) {
                res.render("editoffer", {offer: foundOffer});
            } else {
                res.redirect("back");
            }
        }
    });
});

router.put("/offers/:id", isLoggedIn, function(req, res) {
    Offer.findByIdAndUpdate(req.params.id, req.body.offer, function(err, updatedOffer) {
        if(err){
            res.redirect("/offers");
        } else {
            res.redirect("/offers/" + req.params.id);
            console.log
        }
    });
});

router.delete("/offers/:id", isLoggedIn, function(req, res) {
    Offer.findByIdAndRemove(req.params.id, function(err, updatedOffer) {
        if(err){
            res.redirect("/offers");
        } else {
            res.redirect("/offers");
        }
    });
});

router.get("/offers/:id/response", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err && (!foundOffer)) {
            console.log(err);
            res.redirect("/offers");
        } else {
            if (foundOffer.author.id.equals(req.user._id)) {
                res.redirect("back");
            } else {
                res.render("offerResponse", {offer: foundOffer});
            }
        }
    });
});

router.post("/offers/:id/response", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            console.log(err);
            res.redirect("/offers");
        } else {
            if (foundOffer.author.id.equals(req.user._id)) {
                res.redirect("back");
            } else {
                res.render("offerResponse", {offer: foundOffer});
            }
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