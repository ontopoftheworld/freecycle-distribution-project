var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");
    Store = require("../models/store");

// Store routes:

router.get("/store", isLoggedIn, function(req, res) {
    Store.find({}, function(err, allItems){
        if(err){
            console.log(err);
        } else {
            res.render("store", {items: allItems} );
        }
    });
});

router.get("/store/new", isLoggedIn, function(req, res) {
    res.render("newStoreItem");
});

router.post("/store", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
        } else {
            var title = req.body.item.title;
            var desc = req.body.item.desc;
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var hourPrice = req.body.item.hourPrice;
            var category = req.body.item.category;
            var newItem = {title: title, desc: desc, author: author, hourPrice: hourPrice, category: category};
            Store.create(newItem, function(err, newI) {
                if(err){
                    console.log(err);
                    res.render("newStoreItem");
                } else {
                    res.redirect("/store");
                }
            });
        }
    });
});

router.get("/store/:id", isLoggedIn, function(req, res) {
    Store.findById(req.params.id, function(err, foundItem) {
        if(err) {
            console.log(err);
        } else if (!foundItem) {
            res.redirect("back");
        } else {
            res.render("showStoreItem", {item: foundItem});
        }
    });
});

router.get("/store/:id/edit", isLoggedIn, function(req, res) {
    Store.findById(req.params.id, function(err, foundItem) {
        if(err) {
            res.redirect("/store");
        } else if (!foundItem) {
            res.redirect("back");
        } else {
            if (foundItem.author.id.equals(req.user._id)) {
                res.render("editStoreItem", {item: foundItem});
            } else {
                res.redirect("back");
            }
        }
    });
});

router.put("/store/:id", isLoggedIn, function(req, res) {
    Store.findByIdAndUpdate(req.params.id, req.body.item, function(err, updatedItem) {
        if(err){
            res.redirect("/store");
        } else if (!foundItem) {
            res.redirect("back");
        } else {
            res.redirect("/store/" + req.params.id);
        }
    });
});

router.delete("/store/:id", isLoggedIn, function(req, res) {
    Store.findByIdAndRemove(req.params.id, function(err, updatedItem) {
        if(err){
            res.redirect("/store");
        } else if (!foundItem) {
            res.redirect("back");
        } else {
            res.redirect("/store");
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