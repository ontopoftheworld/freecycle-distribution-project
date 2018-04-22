var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");
    OfferResponse = require("../models/offerResponse");

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

router.get("/offers/sort", isLoggedIn, function(req, res) {
    var sortCategory=req.query.category;
    Offer.find({"category": sortCategory} , function(err, allOffers){
    if(err){
        console.log(err);
    } else {
        res.render("offers", {offers: allOffers} );
    }
    });
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
                    req.flash("success", "You have successfully posted an offer");
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
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
        } else {
            Offer.findById(req.params.id, function(err, foundOffer) {
                if(err) {
                    console.log(err);
                } else if (!foundOffer){
                    res.redirect("back");
                } else {
                    if (foundOffer.author.id.equals(req.user._id)) {
                        OfferResponse.find({}, function(err, allOfferResponses){
                            if(err){
                                console.log(err);
                            } else {
                                res.render("offerResponseA", {offer: foundOffer, offerResponses: allOfferResponses});
                            }
                        });
                    } else {
                        var found = false;
                        var i;
                        for (i = 0; i < foundOffer.offerResponse.length; i++) {
                            if (foundOffer.offerResponse[i].responder.equals(req.user._id)) {
                                found = true;
                                break;
                            }
                        }
                        if (found){
                            OfferResponse.findById(foundOffer.offerResponse[i].responseID, function(err, foundResponse) {
                                if(err) {
                                    console.log(err);
                                } else if (!foundResponse){
                                    res.redirect("back");
                                } else {
                                    res.render("offerResponseB", {offer: foundOffer, offerResponses: foundResponse});
                                }
                            });
                        }
                        else {
                            res.render("offerResponse", {offer: foundOffer});
                        }
                    }
                }
            });
        }
    });
});

// OFFER RESPONSE
router.post("/offers/:id/response", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/offers");
        } else {
            Offer.findById(req.params.id, function(err, foundOffer) {
                if(err) {
                    console.log(err);
                } else if (!foundOffer){
                    res.redirect("/offers");
                } else {
                    if (foundOffer.author.id.equals(req.user._id)) {
                        res.redirect("/offers");
                    } else {
                        var found = false;
                        var i;
                        for (i = 0; i < foundOffer.offerResponse.length; i++) {
                            if (foundOffer.offerResponse[i].responder.equals(req.user._id)) {
                                found = true;
                                break;
                            }
                        }
                        if (found){
                            OfferResponse.findById(foundOffer.offerResponse[i].responseID, function(err, foundResponse) {
                                if(err) {
                                    console.log(err);
                                } else if (!foundResponse){
                                    res.redirect("/offers");
                                } else {
                                    res.redirect("/offers");
                                }
                            });
                        }
                        else {
                            var offerId = foundOffer._id;
                            var responder = req.user._id;
                            var hours = foundOffer.hoursOffered;
                            var message = req.body.message;
                            var newResponse = {offerId: offerId, responder: responder, hours: hours, message: message};
                            OfferResponse.create(newResponse, function(err, newOR) {
                                if(err){
                                    console.log(err);
                                    res.render("offerResponse");
                                } else {
                                    user.offerResponse.push(newOR);
                                    user.save();
                                    foundOffer.offerResponse.push({responder: responder, responseID: newOR._id});
                                    foundOffer.save();
                                    req.flash("success", "Your response has been sent");
                                    res.redirect("/offers");
                                }
                            });
                        }
                    }
                }
            });
        }
    });
});

router.get("/response", isLoggedIn, function(req, res) {
    OfferResponse.find({"responder": req.user._id}, function(err, foundResponses){
        if(err){
            console.log(err);
        } else {
            res.render("allOfferResponses", {responses: foundResponses} );
        }
    });
});

router.get("/response/:id", isLoggedIn, function(req, res) {
    OfferResponse.findById(req.params.id, function(err, foundResponse) {
        if(err) {
            console.log(err);
        } else {
            res.render("showOfferResponse", {response: foundResponse});
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