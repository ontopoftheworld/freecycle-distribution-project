var express = require("express");
var router = express.Router();
var passport = require("passport");
var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users"),
    OfferResponse = require("../models/offerResponse"),
    Escrow = require("../models/escrow");

// Offers routes:
router.get("/offers", isLoggedIn, function(req, res) {
	Offer.find({"isAccepted": false, "isActive": true}, function(err, allOffers){
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
    var id = req.query.userId;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    var sortCategory=req.query.category;
    Offer.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
    if(err){
        console.log(err);
    } else {
        res.render("offersSearch", {offers: result.docs, pages: result.pages, searchContent: null, sortCategory: sortCategory} );
    }
    });
});

router.post("/offers", isLoggedIn, function(req, res) {
    if (req.body.offer.hoursOffered < 0) {
        req.flash("error", "Invalid input for hours offered");
        res.redirect("/offers");
    } else {
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
		var location = req.body.offer.location;
		var newOffer = {title: title, desc: desc, author: author,
				hoursOffered: hoursOffered, category: category, location: location};
		Offer.create(newOffer, function(err, newO) {
                    if(err){
			console.log(err);
			res.render("newoffer");
                    } else {
			user.offers.push(newO);
			user.save();
			req.flash("success", "You have successfully posted an Offer");
			res.redirect("/offers");
                    }
		});
            }
	});
    }
});

router.get("/offers/:id", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            console.log(err);
		} if (!foundOffer) {
            res.redirect("back");
        } else {
            res.render("showoffer", {offer: foundOffer});
        }
    });
});

router.get("/offers/:id/edit", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            res.redirect("/offers");
		} if (!foundOffer) {
            res.redirect("back");
        } else {
            if (foundOffer.author.id.equals(req.user._id) || req.user.isAdmin) {
                res.render("editoffer", {offer: foundOffer});
            } else {
                res.redirect("back");
            }
        }
    });
});

router.put("/offers/:id", isLoggedIn, function(req, res) {
	Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            res.redirect("/offers");
        } else {	
			if (foundOffer.author.id.equals(req.user._id) || req.user.isAdmin) {
				Offer.findByIdAndUpdate(req.params.id, req.body.offer, function(err, updatedOffer) {
					if(err){
						res.redirect("/offers");
					} else {
						res.redirect("/offers/" + req.params.id);
					}
				});
			} else {
				res.redirect("back");
			}
		}
    });
});

router.delete("/offers/:id", isLoggedIn, function(req, res) {
    Offer.findById(req.params.id, function(err, foundOffer) {
        if(err) {
            res.redirect("/offers");
        } if (!foundOffer) {
            res.redirect("back");
        } else {
			if (foundOffer.author.id.equals(req.user._id) || req.user.isAdmin) {
				if (foundOffer.offerResponse.length > 0) {
					req.flash("error", "You can no longer delete this offer. However, you may close it.");
					res.redirect("back");
				} else {
					Offer.findByIdAndRemove(req.params.id, function(err, updatedOffer) {
						if(err){
							res.redirect("/offers");
						} else {
							res.redirect("/offers");
						}
					});
				}
			}
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
				// render the page that lets the author look at all requests put in
                                res.render("offerResponseA",
					   {offer: foundOffer, offerResponses: allOfferResponses});
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
                            OfferResponse.findById(foundOffer.offerResponse[i].responseID,
						   function(err, foundResponse) {
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
			  if (foundChat[0].senderA.displayName === req.user.username) {
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
			      { $push : { "message" : {
				  "sentBy" : "The Freecycle Distribution Project Admins",
				  "time" : timeU,
				  "info" : toUserName + ", you have a new response " +
				      "to your offer (" + foundOffer.title +
				      ") from " +
				      req.user.username + "! " +
				      "They are offering " + hours + " hours in exchange " +
				      "for its completion." +
				      ' Here is their message: "' +  message +
				      '". Feel free to use this chat to further discuss this with ' +
				      req.user.username + ". You may accept this offer from the " +
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
						    displayName : req.user.username,
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
				      { $push : { "message" : {
					  "sentBy" : "The Freecycle Distribution Project Admins",
					  "time" : timeU,
					  "info" : toUserName + ", you have a new response " +
					      "to your offer (" + foundOffer.title +
					      ") from " +
					      req.user.username + "! " +
					      "They are offering " + hours + " hours in exchange " +
					      "for its completion." +
					      ' Here is their message: "' +  message +
					      '". Feel free to use this chat to further discuss this with ' +
					      req.user.username + ". You may accept this offer from the " +
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
                } if (foundOffer.length <= 0) {
                    res.send("OFFER NOT FOUND");
                } else if (!(foundOffer.author.id.equals(req.user._id)|| foundResponse.responder.equals(req.user._id))) {
                    req.flash("error", "You do not have access to this page");
                    res.redirect("back");
                } else {
		    res.render("showOfferResponse",
			       {"currentUser": req.user,
				"offer": foundOffer,
				"response": foundResponse,
				"responderId": foundResponse.responder});
                }
            });
        }
    });
});

router.post("/response/:id", isLoggedIn, function(req, res) {
    OfferResponse.findById(req.params.id, function(err, foundResponse) {
        if (err) {
            console.log(err);
        } else if (!foundResponse) {
            res.redirect("back");
        } else {
            var offerId = foundResponse.offerId;
            Offer.findById(offerId, function(err, foundOffer){
                if (err){
                    console.log(err);
                } else if (foundOffer.length <= 0) {
                    res.send("OFFER NOT FOUND");
                } else if (!(foundOffer.author.id.equals(req.user._id)||
			     foundResponse.responder.equals(req.user._id))) {
                    req.flash("error", "You do not have access to this page.");
                    res.redirect("back");
                } else if (foundOffer.author.id.equals(req.user._id)) {
		    handleAccept(req, foundResponse, foundOffer, res);
                }
            });
        }
    });
});

function handleAccept(req, foundResponse, foundOffer, res) {
    User.find({_id: foundResponse.responder}, function(err, responderInfo) {
	// check if the responder has enough hours to request the user's offer.
	if (responderInfo.length > 0 &&
	    responderInfo[0].userHours >= foundResponse.hours) {
	    // transfer specified amt of responder's hours to holding.
	    let finalHrs = responderInfo[0].userHours - foundResponse.hours;
	    User.findByIdAndUpdate(
		foundResponse.responder, {"userHours": finalHrs,
					  $push : { "hoursHistory": {
					      "action" :
					      "Your response to an offer was accepted. " +
						  "Hours transferred to holding.",
					      "change" : (-1 * foundResponse.hours),
					      "newHours" : finalHrs
					  } }},
		function(err, updatedResponder) {
		    var newEscrowEntry = {fromUser: foundResponse.responder,
					  toUser: req.user._id,
					  hours: foundResponse.hours,
					  offerResponseId: foundResponse._id};
		    Escrow.create(newEscrowEntry, function(err, newE) {
			if(err){
			    // in general, this should not occur
			    req.flash("error", "Sorry, there was a " +
				      "problem accepting the request.");
			    res.redirect("/offers");
			} else {
			    // update status of request to accepted.
			    OfferResponse.findByIdAndUpdate(
				foundResponse._id,
				{$set : {isAccepted: true}},
				function(err, updatedResponse) {
				    if(err){
					// in general, this should not occur
					req.flash("error", "Sorry, there was a problem " +
						  "accepting the request.");
					res.redirect("/offers");
				    } else {
					updatedResponse.isAccepted = true;
					Offer.findByIdAndUpdate(
					    foundOffer._id,
					    {$set : {isAccepted: true}},
					    function() {
						req.flash("success", "You have accepted this request.");
						res.render("showOfferResponse",
							   {"currentUser": req.user,
							    "offer": foundOffer,
							    "response": updatedResponse,
							    "responderId": updatedResponder._id});
					    });
				    }
				});
			}
		    });
		});
	} else if (responderInfo.length > 0) {
	    // if the responder does not have enough hours, notify the offer author.
	    req.flash("error", "Unfortunately the responder does not have" +
		      " enough hours to take on your offer.");
	    res.redirect('back');

	} else {
	    req.flash("error", "Sorry, the responder has retracted their request.");
	    res.redirect('back');
	}
    });
}

// close an incomplete response to offer -->
// Hours get transferred from Escrow to responder.
router.post("/response/:id/closeIncomplete", isLoggedIn, function(req, res) {
    Escrow.find({"offerResponseId": req.params.id}, function(err, foundEscrow) {
	if(err){
	    // in general, this should not occur
	    req.flash("error", "Sorry, an error occurred.");
	    res.redirect("back");
	} else {
	    if (foundEscrow.length <= 0) {
		req.flash("error", "This offer has already been closed.");
		res.redirect("/offers");
	    } else {
		OfferReponse.findById(
		    foundEscrow[0].offerResponseId, function(err, foundOfferResponse) {
			Offer.findByIdAndUpdate(
			    foundOfferResponse[0].offerId,
			    { $set : { "isActive" : false }},
			    { upsert : false, multi : true, new: true},
			    function() {
				const messageUponSuccess = "The offer has been closed." +
				      " The hours have been returned to the responder.";
				const logMessage = "An offer that you had requested " +
				      " was closed without its completion. " +
				      "The hours in holding were returned to you";
				addHours(foundEscrow[0].fromUser, foundEscrow[0].hours,
					 req, res, messageUponSuccess, logMessage);
			    });
		    });
	    }
	}
    });
});

// close a completed response to offer -->
// Hours get transferred from Escrow to poster
router.post("/response/:id/markCompleted", isLoggedIn, function(req, res) {
    Escrow.find({"offerResponseId": req.params.id}, function(err, foundEscrow) {
	if(err){
	    // in general, this should not occur
	    req.flash("error", "Sorry, an error occurred.");
	    res.redirect("back");
	} else {
	    if (foundEscrow.length <= 0) {
		req.flash("error", "This offer has already been closed.");
		res.redirect("/offers");
	    } else {
		OfferResponse.findByIdAndUpdate(
		    foundEscrow[0].offerResponseId,
		    { $set : { "isComplete" : true }},
		    { new: true },
		    function(err, foundOfferResponse) {
			Offer.findByIdAndUpdate(
			    foundOfferResponse.offerId,
			    { $set : { "isActive" : false, "isCompleted": true }},
			    { upsert : false, multi : true },
			    function() {
				const messageUponSuccess = "The offer has been completed." +
				      " The hours have been released to the poster.";
				const logMessage = "You completed a request to your " +
				      "posted offer and earned the hours for its completion.";
				addHours(foundEscrow[0].toUser, foundEscrow[0].hours,
					 req, res, messageUponSuccess, logMessage);
			    });
		    });
	    }
	}
    });
});

// Adds a certain number of hours to a user's account
function addHours(toUser, numHours, req, res, messageUponSuccess, logMessage) {
    User.find({_id : toUser}, function(err, foundUser) {
	if (err || foundUser.length <= 0) {
	    req.flash("error", "Something went wrong.");
	    res.redirect("back");
	} else {
	    User.findByIdAndUpdate(
		toUser,
		{"userHours": foundUser[0].userHours + numHours,
		 $push : { "hoursHistory": {
		     "action" : logMessage,
		     "change" : numHours,
		     "newHours" :  foundUser[0].userHours + numHours
		 } }},
		function(err, updatedUser) {
		    if(err){
			// in general, this should not occur
			req.flash("error", "Something went wrong.");
			res.redirect("/offers");
		    } else {
			Escrow.remove({"offerResponseId" : req.params.id}, function(err, result) {
			    if (err) {
				req.flash("error", "Something went wrong.");
				res.redirect("/offers");
			    } else {
				req.flash("success", messageUponSuccess);
				/*res.render("showOfferResponse",
				  {"currentUser": req.user,
				  "offer": foundOffer,
				  "response": foundResponse,
				  "responderId": updatedResponder._id});*/
				res.redirect("/offers");
			    }
			});
		    }
		});
	}
    });
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;
