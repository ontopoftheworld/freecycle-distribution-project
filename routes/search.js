var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    Store = require("../models/store"),
    User = require("../models/users");

router.get("/search/stores", isLoggedIn, function(req, res) {
    if (!req.query.searchContent) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Store.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}, "status": false} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("storesSearch", {type: "search", items: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/search/offers", isLoggedIn, function(req, res) {
    if (!req.query.searchContent) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("offersSearch", {type: "search", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/search/requests", isLoggedIn, function(req, res) {
    if (!req.query.searchContent) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Request.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("requestsSearch", {type: "search", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/search/users", isLoggedIn, function(req, res) {
    if (!req.query.searchContent) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    User.find({$text: {$search: searchContent}}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("users", {users: result} );
        }
    });
});


router.get("/sort/stores", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Store.paginate({"author.id": {$ne: id}, "category": sortCategory, "status": false} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("storesSearch", {type: "sort", items: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/sort/offers", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Offer.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("offersSearch", {type: "sort", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/sort/requests", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    Request.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("requestsSearch", {type: "sort", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
        }
    });
});

router.get("/sortonsearch/stores", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (sortCategory=="" || sortCategory==undefined) {
        Store.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}, "status": false} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("storesSearch", {type: "search", items: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else if (searchContent=="" || searchContent==undefined) {
        Store.paginate({"author.id": {$ne: id}, "category": sortCategory, "status": false} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("storesSearch", {type: "sort", items: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else{
        Store.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}, "category": sortCategory, "status": false} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("storesSearch", {type: "search and sort", items: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
    });
    }
});

router.get("/sortonsearch/offers", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (sortCategory=="" || sortCategory==undefined) {
        Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("offersSearch", {type: "search", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else if (searchContent=="" || searchContent==undefined) {
        Offer.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("offersSearch", {type: "sort", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else{
        Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("offersSearch", {type: "search and sort", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
    });
    }
});

router.get("/sortonsearch/requests", isLoggedIn, function(req, res) {
    if (!req.query.sortCategory) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var sortCategory = req.query.sortCategory;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (sortCategory=="" || sortCategory==undefined) {
        Request.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {type: "search", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else if (searchContent=="" || searchContent==undefined) {
        Request.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {type: "sort", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
        });
    }else{
        Request.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {type: "search and sort", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
            }
    });
    }
});


router.get("/search", isLoggedIn, function(req, res) {
    if (!req.query.searchContent) {
        req.flash("error", "Invalid Search Query");
        res.redirect("back");
    }
    var searchType=req.query.searchType;
    var searchContent=req.query.searchContent;
    var id = req.query.userId;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (searchType==="requests") {
        Request.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {type: "search", requests: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: null} );
            }
            });
    }else if (searchType==="offers"){
        Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("offersSearch", {type: "search", offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: null} );
        }
        });
    }else{
        res.render("home");
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