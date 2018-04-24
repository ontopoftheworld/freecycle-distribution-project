var express = require("express");
var router = express.Router();
var passport = require("passport");
var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");
    OfferResponse = require("../models/offerResponse");

// Offers routes:

router.get("/offers", isLoggedIn, function(req, res) {
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    
    Offer.paginate({}, {page: currentPage, limit: 4 }, function(err, result) {
        if(err){
            console.log(err);
        } else {
            res.render("offers", {offers: result.docs, pages: result.pages} );
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
                                    req.flash("error", "You have already responded to this offer");
                                    res.redirect("/offers");
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
				    createNewMessageWithOffer(req, foundOffer.author.id, foundOffer.author.username,
							      offerId, foundOffer, hours, message);
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

var Messages = require("../models/messages");

function createNewMessageWithOffer(req, toUserId, toUserName, offerId, foundOffer, hours, message) {
    Messages.find({"$or" : [{"$and": [{"senderA.id" : req.user._id},
				      {"senderB.id" : toUserId}]},
			    {"$and": [{"senderA.id" : toUserId},
				      {"senderB.id" : req.user._id}]}]},
		  function (err, foundChat) {
		      if (foundChat !== undefined && foundChat.length !== 0) {
			  // previous conversation exists
			  let cGrp = foundChat[0].chatGroup;
			  let toUser = foundChat[0].senderA.displayName;
			  if (toUser === req.user.firstName) {
			      toUser = foundChat[0].senderB.displayName;
			  }

			  // change the current user's seen status to true, so that the message
			  // can be marked as read, and the other user's seen status as false
			  if (foundChat[0].senderA.displayName === req.user.firstName) {
			      Messages.update(
				  { "chatGroup" : cGrp },
				  { $set : { "senderA.seenMessages" : true, "senderB.seenMessages" : false }},
				  { upsert : false, multi : true },
				  function (err, object) {
				      if (err) {
					  console.log("ERROR: problems updating seen status");
				      } 
				  }
			      );
			  } else {
			      Messages.update(
				  { "chatGroup" : cGrp },
				  { $set : { "senderB.seenMessages" : true, "senderA.seenMessages" : false }},
				  { upsert : false, multi : true },
				  function (err, object) {
				      if (err) {
					  console.log("ERROR: problems updating seen status");
				      } 
				  }
			      );
			  }
			  
			  // add the message to the database
			  let date = new Date(); 
			  let timeU = (date.getMonth()+1) + "/" +
			      date.getDate()  + "/" + date.getFullYear() + ", " +
			      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

			  Messages.update(
			      { "chatGroup" : cGrp },
			      { $push : { "message" : { "sentBy" : "The Freecycle Distribution Project Admins",
							"time" : timeU,
							"info" : toUserName + ", you have a new response " +
							"to your offer (" + foundOffer.title +
							") from " +
							req.user.firstName + "! " +
							"They are offering " + hours + " hours in exchange " +
							"for its completion." +
							' Here is their message: "' +  message +
						      	'". Feel free to use this chat to further discuss this with ' +
							req.user.firstName + ". You may accept this offer from the " +
							'"Responses to Your Offer" page or at this link: ' +
							"/offers/" + offerId + "/response"}}},
			      { upsert : false, multi : true },
			      function (err, object) {
				  if (err) {
				      console.log("ERROR: problems updating message");
				  } 
			      }
			  );
		      } else {
			  // create new chatgroup
			  var cGrp = require('crypto').createHash('md5')
			      .update(req.user._id + "" + toUserId).digest("hex");
			  var newChat = {message: [],
					 chatGroup: cGrp,
					 senderA: { id : req.user._id,
						    displayName : req.user.firstName,
						    seenMessages : true},
					 senderB: { id : toUserId,
						    displayName : toUserName,
						    seenMessages : false}};
			  Messages.create(newChat, function(err, newM) {
			      if(err){
				  console.log(err);
			      } else {
				  // add the message to the database
				  let date = new Date(); 
				  let timeU = (date.getMonth()+1) + "/" +
				      date.getDate()  + "/" + date.getFullYear() + ", " +
				      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

				  Messages.update(
				      { "chatGroup" : cGrp },
				      { $push : { "message" : { "sentBy" : "The Freecycle Distribution Project Admins",
								"time" : timeU,
								"info" : toUserName + ", you have a new response " +
								"to your offer (" + foundOffer.title +
								") from " +
								req.user.firstName + "! " +
								"They are offering " + hours + " hours in exchange " +
								"for its completion." +
								' Here is their message: "' +  message +
						      		'". Feel free to use this chat to further discuss this with ' +
								req.user.firstName + ". You may accept this offer from the " +
								'"Responses to Your Offer" page or at this link: ' +
								"/offers/" + offerId + "/response"}}},
				      { upsert : false, multi : true },
				      function (err, object) {
					  if (err) {
					      console.log("ERROR: problems updating message");
					  } 
				      }
				  );
			      }
			  });
		      }
		  });
}

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
        } else if (!foundResponse) {
            res.redirect("back");
        } else {
            var offerId = foundResponse.offerId;
            Offer.findById(offerId, function(err, foundOffer){
                if(err){
                    console.log(err);
                } if (!foundOffer) {
                    res.send("OFFER NOT FOUND");
                } else {
                    res.render("showOfferResponse", {response: foundResponse, offer: foundOffer} );
                }
            });
        }
    });
});

router.post("/response/:id", isLoggedIn, function(req, res) {
    OfferResponse.findById(req.params.id, function(err, foundResponse) {
        if(err) {
            console.log(err);
        } if (!foundResponse) {
            res.redirect("back");
        } else {
            var offerId = foundResponse.offerId;
            Offer.findById(offerId, function(err, foundOffer){
                if(err){
                    console.log(err);
                } if (!foundOffer) {
                    res.redirect("back");
                } else {
                    if (foundOffer.author.id.equals(req.user._id)) {
                        OfferResponse.findByIdAndUpdate(foundResponse._id, {isAccepted: true}, function(err, updatedOffer) {
                            if(err){
                                res.redirect("/offers");
                            } else {
                                req.flash("success", "You have accepted this request");
                                res.redirect('back');
                            }
                        });
                    }
                }
            });
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
