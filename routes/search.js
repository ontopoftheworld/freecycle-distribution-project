var express = require("express");
var router = express.Router();
var passport = require("passport");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

router.get("/search/sort", isLoggedIn, function(req, res) {
    var searchType=req.query.searchType;
    var searchContent=req.query.searchContent;
    var sortCategory=req.query.category;
    var id = req.query.userId;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (searchContent=== "") {
        Offer.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("offersSearch", {offers: result.docs, pages: result.pages, searchContent: null, sortCategory: sortCategory} );
        }
        });
    }else{
        if (searchType==="requests") {
            Request.find({$text: {$search: searchContent}} , function(err, allRequests){
                if(err){
                    console.log(err);
                } else {
                    res.render("requestsSearch", {requests: allRequests} );
                }
            });
        }else if (searchType==="offers"){
                if (sortCategory=="") {
                Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
                if(err){
                    console.log(err);
                } else {
                    res.render("offersSearch", {offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
                }
                });
            }else{
                Offer.paginate({"author.id": {$ne: id}, "category": sortCategory, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
                if(err){
                    console.log(err);
                } else {
                    res.render("offersSearch", {offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: sortCategory} );
                }
                });
            }

        }else{
            res.render("home");
        }
    }

});

router.get("/search", isLoggedIn, function(req, res) {
    var searchType=req.query.searchType;
    var searchContent=req.query.seachContent;
    var id = req.query.userId;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    if (searchType==="requests") {
        Request.find({$text: {$search: searchContent}} , function(err, allRequests){
            if(err){
                console.log(err);
            } else {
                res.render("requestsSearch", {requests: allRequests} );
            }
        });
    }else if (searchType==="offers"){
        Offer.paginate({"author.id": {$ne: id}, $text: {$search: searchContent}} ,{page: currentPage, limit: 4}, function(err, result){
        if(err){
            console.log(err);
        } else {
            res.render("offersSearch", {offers: result.docs, pages: result.pages, searchContent: searchContent, sortCategory: null} );
        }
        });
    }else{
        res.render("home");
    }




    // if (searchType==="requests") {
    //     Request.find({$text: {$search: searchContent}} , function(err, allRequests){
    //         if(err){
    //             console.log(err);
    //         } else {
    //             res.render("requestsSearch", {requests: allRequests} );
    //         }
    // });
    // }else if (searchType==="offers"){






    //     Offer.find({$text: {$search: searchContent}} , function(err, allOffers){
    //         if(err){
    //             console.log(err);
    //         } else {
    //             res.render("offersSearch", {offers: allOffers, searchType:searchType, searchContent:searchContent} );
    //         }
    // });
    // }else{
    //     res.render("home");
    // }
});


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;