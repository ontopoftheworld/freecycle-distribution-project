var express         = require("express"),
    app             = express(),
    methodOverride  = require("method-override"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport-local");

mongoose.connect("mongodb://localhost/timebank");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//DATABASE SCHEMA SETUP
var requestSchema = new mongoose.Schema({
    title: String,
    desc: String
});
var Request = mongoose.model("Request", requestSchema);

var offerSchema = new mongoose.Schema({
    title: String,
    desc: String
});
var Offer = mongoose.model("Offer", offerSchema);

// Login page
app.get("/", function(req, res){
    res.render("home");
});

//REQUESTS

app.get("/requests", function(req, res) {
    Request.find({}, function(err, allRequests){
        if(err){
            console.log(err);
        } else {
            res.render("requests", {requests: allRequests} )
        }
    });
});

app.get("/requests/new", function(req, res) {
    res.render("newrequest");
});

app.post("/requests", function(req, res) {
    Request.create(req.body.request, function(err, newR) {
        if(err){
            res.render("newrequest");
        } else {
            res.redirect("/requests");
        }
    });
});

app.get("/requests/:id", function(req, res) {
    Request.findById(req.params.id, function(err, foundRequest) {
        if(err) {
            console.log(err);
        } else {
            res.render("showrequest", {request: foundRequest});
        }
    });
});

app.get("/requests/:id/edit", function(req, res) {
    Request.findById(req.params.id, function(err, foundRequest) {
        if(err) {
            res.redirect("/requests");
        } else {
            res.render("editrequest", {request: foundRequest});
        }
    });
});

app.put("/requests/:id", function(req, res) {
    Request.findByIdAndUpdate(req.params.id, req.body.request, function(err, updatedRequest) {
        if(err){
            res.redirect("/requests");
        } else {
            res.redirect("/requests/" + req.params.id);
        }
    });
});

app.delete("/requests/:id", function(req, res) {
    Request.findByIdAndRemove(req.params.id, function(err, updatedRequest) {
        if(err){
            res.redirect("/requests")
        } else {
            res.redirect("/requests")
        }
    });
});

//Offers:

app.get("/offers", function(req, res) {
    Offer.find({}, function(err, allOffers){
        if(err){
            console.log(err);
        } else {
            res.render("offers", {offers: allOffers} );
        }
    });
});

app.get("/offers/new", function(req, res) {
    res.render("newoffer");
});

app.post("/offers", function(req, res) {
    Offer.create(req.body.offer, function(err, newR) {
        if(err){
            res.render("newoffer");
        } else {
            res.redirect("offers");
        }
    });
});

app.get("/offers/:id", function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            console.log(err);
        } else {
            res.render("showoffer", {offer: foundOffer});
        }
    });
});

app.get("/offers/:id/edit", function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            res.redirect("offers");
        } else {
            res.render("editoffer", {offer: foundOffer});
        }
    });
});

app.put("/offers/:id", function(req, res) {
    Offer.findByIdAndUpdate(req.params.id, req.body.offer, function(err, updatedOffer) {
        if(err){
            res.redirect("/offers");
        } else {
            res.redirect("/offers/" + req.params.id);
            console.log
        }
    });
});

app.delete("/offers/:id", function(req, res) {
    Offer.findByIdAndRemove(req.params.id, function(err, updatedOffer) {
        if(err){
            res.redirect("/offers");
        } else {
            res.redirect("/offers");
        }
    });
});

//STORE

app.get("/store", function(req, res) {
    res.render("store");
});

app.listen(8080, function(){
    console.log('- Server listening on port 8080');
});