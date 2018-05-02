var express = require("express");
var router = express.Router();
var passport = require("passport");
var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users"),
    RequestResponse = require("../models/requestResponse"),
    Escrow = require("../models/escrow");

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

router.get("/requests/sort", isLoggedIn, function(req, res) {
    var id = req.query.userId;
    var currentPage = req.query.pageChoose;
    if(currentPage === undefined){
        currentPage=1;
    }
    var sortCategory=req.query.category;
    Request.paginate({"author.id": {$ne: id}, "category": sortCategory} ,{page: currentPage, limit: 4}, function(err, result){
    if(err){
        console.log(err);
    } else {
        res.render("requestsSearch", {requests: result.docs, pages: result.pages, searchContent: null, sortCategory: sortCategory} );
    }
    });
});

router.post("/requests", isLoggedIn, function(req, res) {
    if (req.body.request.hoursOffered < 0) {
        req.flash("error", "Invalid input for hours offered");
        res.redirect("/requests");
    } else {
        User.findById(req.user._id, function(err, user){
            if(err){
            console.log(err);
            } else {
                var title = req.body.request.title;
                var desc = req.body.request.desc;
                var author = {
                            id: req.user._id,
                            username: req.user.username
                }
                var hoursOffered = req.body.request.hoursOffered;
                var category = req.body.request.category;
                var newRequest = {title: title, desc: desc, author: author,
                        hoursOffered: hoursOffered, category: category};
                Request.create(newRequest, function(err, newR) {
                    if(err){
                        console.log(err);
                        res.render("newrequest");
                    } else {
                        user.requests.push(newR);
                        user.save();
                        req.flash("success", "You have successfully posted a Request");
                        res.redirect("/requests");
                    }
                });
            }
        });
    }
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
            if (foundRequest.author.id.equals(req.user._id)) {
                res.render("editrequest", {request: foundRequest});
            } else {
                res.redirect("back");
            }
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
    Request.findById(req.params.id, function(err, foundRequest) {
        if(err) {
            res.redirect("/requests");
        } if (!foundRequest) {
            res.redirect("back");
        } else {
            if (foundRequest.requestResponse.length > 0) {
                req.flash("error", "You can no longer delete this Request. However, you may close it.");
                res.redirect("back");
            } else {
                Request.findByIdAndRemove(req.params.id, function(err, updatedRequest) {
                    if(err){
                        res.redirect("/requests");
                    } else {
                        res.redirect("/requests");
                    }
                });
            }
        }
    });
});

router.get("/requests/:id/response", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
        } else {
            Request.findById(req.params.id, function(err, foundRequest) {
                if(err) {
                    console.log(err);
                } else if (!foundRequest){
                    res.redirect("back");
                } else {
                    if (foundRequest.author.id.equals(req.user._id)) {
                        RequestResponse.find({}, function(err, allRequestResponses){
                            if(err){
                                console.log(err);
                            } else {
				                // render the page that lets the author look at all requests put in
                                res.render("requestResponseA",
					            {request: foundRequest, requestResponses: allRequestResponses});
                            }
                        });
                    } else {
                        var found = false;
                        var i;
                        for (i = 0; i < foundRequest.requestResponse.length; i++) {
                            if (foundRequest.requestResponse[i].responder.equals(req.user._id)) {
                                found = true;
                                break;
                            }
                        }
                        if (found){
                            RequestResponse.findById(foundRequest.requestResponse[i].responseID,
						   function(err, foundResponse) {
                                if(err) {
                                    console.log(err);
                                } else if (!foundResponse){
                                    res.redirect("back");
                                } else {
                                    req.flash("error", "You have already responded to this Request");
                                    res.redirect("/requests");
                                }
                            });
                        }
                        else {
                            res.render("requestResponse", {request: foundRequest});
                        }
                    }
                }
            });
        }
    });
});

// Request RESPONSE
router.post("/requests/:id/response", isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/requests");
        } else {
            Request.findById(req.params.id, function(err, foundRequest) {
                if(err) {
                    console.log(err);
                } else if (!foundRequest){
                    res.redirect("/requests");
                } else {
                    if (foundRequest.author.id.equals(req.user._id)) {
                        res.redirect("/requests");
                    } else {
                        var found = false;
                        var i;
                        for (i = 0; i < foundRequest.requestResponse.length; i++) {
                            if (foundRequest.requestResponse[i].responder.equals(req.user._id)) {
                                found = true;
                                break;
                            }
                        }
                        if (found){
                            RequestResponse.findById(foundRequest.requestResponse[i].responseID, function(err, foundResponse) {
                                if(err) {
                                    console.log(err);
                                } else if (!foundResponse){
                                    res.redirect("/requests");
                                } else {
                                    res.redirect("/requests");
                                }
                            });
                        }
                        else {
                            var requestId = foundRequest._id;
                            var responder = req.user._id;
                            var hours = foundRequest.hoursOffered;
                            var message = req.body.message;
                            var newResponse = {requestId: requestId, responder: responder, hours: hours, message: message};
                            RequestResponse.create(newResponse, function(err, newRR) {
                                if(err){
                                    console.log(err);
                                    res.render("requestResponse");
                                } else {
                                    user.requestResponse.push(newRR);
                                    user.save();
                                    foundRequest.requestResponse.push({responder: responder, responseID: newRR._id});
                                    foundRequest.save();
				                    //createNewMessageWithOffer(req, foundRequest.author.id, foundOffer.author.username,
							      //offerId, foundRequest, hours, message);
                                    req.flash("success", "Your response has been sent");
                                    res.redirect("/requests");
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

// function createNewMessageWithOffer(req, toUserId, toUserName, offerId, foundOffer, hours, message) {
//     Messages.find({"$or" : [{"$and": [{"senderA.id" : req.user._id},
// 				      {"senderB.id" : toUserId}]},
// 			    {"$and": [{"senderA.id" : toUserId},
// 				      {"senderB.id" : req.user._id}]}]},
// 		  function (err, foundChat) {
// 		      if (foundChat !== undefined && foundChat.length !== 0) {
// 			  // previous conversation exists
// 			  let cGrp = foundChat[0].chatGroup;
// 			  let toUser = foundChat[0].senderA.displayName;
// 			  if (toUser === req.user.firstName) {
// 			      toUser = foundChat[0].senderB.displayName;
// 			  }

// 			  // change the current user's seen status to true, so that the message
// 			  // can be marked as read, and the other user's seen status as false
// 			  if (foundChat[0].senderA.displayName === req.user.firstName) {
// 			      Messages.update(
// 				  { "chatGroup" : cGrp },
// 				  { $set : { "senderA.seenMessages" : true, "senderB.seenMessages" : false }},
// 				  { upsert : false, multi : true },
// 				  function (err, object) {
// 				      if (err) {
// 					  console.log("ERROR: problems updating seen status");
// 				      } 
// 				  }
// 			      );
// 			  } else {
// 			      Messages.update(
// 				  { "chatGroup" : cGrp },
// 				  { $set : { "senderB.seenMessages" : true, "senderA.seenMessages" : false }},
// 				  { upsert : false, multi : true },
// 				  function (err, object) {
// 				      if (err) {
// 					  console.log("ERROR: problems updating seen status");
// 				      } 
// 				  }
// 			      );
// 			  }
			  
// 			  // add the message to the database
// 			  let date = new Date(); 
// 			  let timeU = (date.getMonth()+1) + "/" +
// 			      date.getDate()  + "/" + date.getFullYear() + ", " +
// 			      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

// 			  Messages.update(
// 			      { "chatGroup" : cGrp },
// 			      { $push : { "message" : {
// 				  "sentBy" : "The Freecycle Distribution Project Admins",
// 				  "time" : timeU,
// 				  "info" : toUserName + ", you have a new response " +
// 				      "to your offer (" + foundOffer.title +
// 				      ") from " +
// 				      req.user.firstName + "! " +
// 				      "They are offering " + hours + " hours in exchange " +
// 				      "for its completion." +
// 				      ' Here is their message: "' +  message +
// 				      '". Feel free to use this chat to further discuss this with ' +
// 				      req.user.firstName + ". You may accept this offer from the " +
// 				      '"Responses to Your Offer" page or at this link: ' +
// 				      "/offers/" + offerId + "/response"}}},
// 			      { upsert : false, multi : true },
// 			      function (err, object) {
// 				  if (err) {
// 				      console.log("ERROR: problems updating message");
// 				  } 
// 			      }
// 			  );
// 		      } else {
// 			  // create new chatgroup
// 			  var cGrp = require('crypto').createHash('md5')
// 			      .update(req.user._id + "" + toUserId).digest("hex");
// 			  var newChat = {message: [],
// 					 chatGroup: cGrp,
// 					 senderA: { id : req.user._id,
// 						    displayName : req.user.firstName,
// 						    seenMessages : true},
// 					 senderB: { id : toUserId,
// 						    displayName : toUserName,
// 						    seenMessages : false}};
// 			  Messages.create(newChat, function(err, newM) {
// 			      if(err){
// 				  console.log(err);
// 			      } else {
// 				  // add the message to the database
// 				  let date = new Date(); 
// 				  let timeU = (date.getMonth()+1) + "/" +
// 				      date.getDate()  + "/" + date.getFullYear() + ", " +
// 				      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

// 				  Messages.update(
// 				      { "chatGroup" : cGrp },
// 				      { $push : { "message" : {
// 					  "sentBy" : "The Freecycle Distribution Project Admins",
// 					  "time" : timeU,
// 					  "info" : toUserName + ", you have a new response " +
// 					      "to your offer (" + foundOffer.title +
// 					      ") from " +
// 					      req.user.firstName + "! " +
// 					      "They are offering " + hours + " hours in exchange " +
// 					      "for its completion." +
// 					      ' Here is their message: "' +  message +
// 					      '". Feel free to use this chat to further discuss this with ' +
// 					      req.user.firstName + ". You may accept this offer from the " +
// 					      '"Responses to Your Offer" page or at this link: ' +
// 					      "/offers/" + offerId + "/response"}}},
// 				      { upsert : false, multi : true },
// 				      function (err, object) {
// 					  if (err) {
// 					      console.log("ERROR: problems updating message");
// 					  } 
// 				      }
// 				  );
// 			      }
// 			  });
// 		      }
// 		  });
// }

router.get("/response", isLoggedIn, function(req, res) {
    RequestResponse.find({"responder": req.user._id}, function(err, foundResponses){
        if(err){
            console.log(err);
        } else {
            res.render("allRequestResponses", {responses: foundResponses} );
        }
    });
});

router.get("/requests/response/:id", isLoggedIn, function(req, res) {
    RequestResponse.findById(req.params.id, function(err, foundResponse) {
        if(err) {
            console.log(err);
        } else if (!foundResponse) {
            res.redirect("back");
        } else {
            var requestId = foundResponse.requestId;
            Request.findById(requestId, function(err, foundRequest){
                if(err){
                    console.log(err);
                } if (foundRequest.length <= 0) {
                    res.send("Request NOT FOUND");
                } else if (!(foundRequest.author.id.equals(req.user._id)|| foundResponse.responder.equals(req.user._id))) {
                    req.flash("error", "You do not have access to this page");
                    res.redirect("back");
                } else {
		    res.render("showRequestResponse",
			       {"currentUser": req.user,
				"request": foundRequest,
				"response": foundResponse,
				"responderId": foundResponse.responder});
                }
            });
        }
    });
});

router.post("/requests/response/:id", isLoggedIn, function(req, res) {
    RequestResponse.findById(req.params.id, function(err, foundResponse) {
        if (err) {
            console.log(err);
        } else if (!foundResponse) {
            res.redirect("back");
        } else {
            var requestId = foundResponse.requestId;
            Request.findById(requestId, function(err, foundRequest){
                if (err){
                    console.log(err);
                } else if (foundRequest.length <= 0) {
                    res.send("Request NOT FOUND");
                } else if (!(foundRequest.author.id.equals(req.user._id)||
			     foundResponse.responder.equals(req.user._id))) {
                    req.flash("error", "You do not have access to this page.");
                    res.redirect("back");
                } else if (foundRequest.author.id.equals(req.user._id)) {
                    res.redirect("back"); //HANDLE ACCEPT HERE
                }
            });
        }
    });
});

// function handleAccept(req, foundResponse, foundOffer, res) {
//     User.find({_id: foundResponse.responder}, function(err, responderInfo) {
// 	// check if the responder has enough hours to request the user's offer.
// 	if (responderInfo.length > 0 &&
// 	    responderInfo[0].userHours >= foundResponse.hours) {
// 	    // transfer specified amt of responder's hours to holding.
// 	    let finalHrs = responderInfo[0].userHours - foundResponse.hours;
// 	    User.findByIdAndUpdate(
// 		foundResponse.responder, {"userHours": finalHrs,
// 					  $push : { "hoursHistory": {
// 					      "action" :
// 					      "Your response to an offer was accepted. " +
// 						  "Hours transferred to holding.",
// 					      "change" : (-1 * foundResponse.hours),
// 					      "newHours" : finalHrs
// 					  } }},
// 		function(err, updatedResponder) {
// 		    var newEscrowEntry = {fromUser: foundResponse.responder,
// 					  toUser: req.user._id,
// 					  hours: foundResponse.hours,
// 					  offerResponseId: foundResponse._id};
// 		    Escrow.create(newEscrowEntry, function(err, newE) {
// 			if(err){
// 			    // in general, this should not occur
// 			    req.flash("error", "Sorry, there was a " +
// 				      "problem accepting the request.");
// 			    res.redirect("/offers");
// 			} else {
// 			    // update status of request to accepted.
// 			    OfferResponse.findByIdAndUpdate(
// 				foundResponse._id,
// 				{$set : {isAccepted: true}},
// 				function(err, updatedResponse) {
// 				    if(err){
// 					// in general, this should not occur
// 					req.flash("error", "Sorry, there was a problem " +
// 						  "accepting the request.");
// 					res.redirect("/offers");
// 				    } else {
// 					updatedResponse.isAccepted = true;
// 					req.flash("success", "You have accepted this request.");
// 					res.render("showOfferResponse",
// 						   {"currentUser": req.user,
// 						    "offer": foundOffer,
// 						    "response": updatedResponse,
// 						    "responderId": updatedResponder._id});
// 				    }
// 				});
// 			}
// 		    });
// 		});
// 	} else if (responderInfo.length > 0) {
// 	    // if the responder does not have enough hours, notify the offer author.
// 	    req.flash("error", "Unfortunately the responder does not have" +
// 		      " enough hours to take on your offer.");
// 	    res.redirect('back');

// 	} else {
// 	    req.flash("error", "Sorry, the responder has retracted their request.");
// 	    res.redirect('back');
// 	}
//     });
// }

// // close an incomplete response to offer -->
// // Hours get transferred from Escrow to responder.
// router.post("requests/response/:id/closeIncomplete", isLoggedIn, function(req, res) {
//     Escrow.find({"offerResponseId": req.params.id}, function(err, foundEscrow) {
// 	if(err){
// 	    // in general, this should not occur
// 	    req.flash("error", "Sorry, an error occurred.");
// 	    res.redirect("back");
// 	} else {
// 	    if (foundEscrow.length <= 0) {
// 		req.flash("error", "This offer has already been closed.");
// 		res.redirect("/offers");
// 	    } else {
// 		const messageUponSuccess = "The offer has been closed." +
// 		      " The hours have been returned to the responder.";
// 		const logMessage = "An offer that you had requested " +
// 		      " was closed without its completion. " +
// 		      "The hours in holding were returned to you";
// 		addHours(foundEscrow[0].fromUser, foundEscrow[0].hours,
// 			 req, res, messageUponSuccess, logMessage);
// 	    }
// 	}
//     });
// });

// // close a completed response to offer -->
// // Hours get transferred from Escrow to poster
// router.post("/requests/response/:id/markCompleted", isLoggedIn, function(req, res) {
//     Escrow.find({"offerResponseId": req.params.id}, function(err, foundEscrow) {
// 	if(err){
// 	    // in general, this should not occur
// 	    req.flash("error", "Sorry, an error occurred.");
// 	    res.redirect("back");
// 	} else {
// 	    if (foundEscrow.length <= 0) {
// 		req.flash("error", "This offer has already been closed.");
// 		res.redirect("/offers");
// 	    } else {
// 		const messageUponSuccess = "The offer has been completed." +
// 		      " The hours have been released to the poster.";
// 		const logMessage = "You completed a request to your " +
// 		      "posted offer and earned the hours for its completion.";
// 		addHours(foundEscrow[0].toUser, foundEscrow[0].hours,
// 			 req, res, messageUponSuccess, logMessage);
// 	    }
// 	}
//     });
// });

// // Adds a certain number of hours to a user's account
// function addHours(toUser, numHours, req, res, messageUponSuccess, logMessage) {
//     User.find({_id : toUser}, function(err, foundUser) {
// 	if (err || foundUser.length <= 0) {
// 	    req.flash("error", "Something went wrong.");
// 	    res.redirect("back");
// 	} else {
// 	    User.findByIdAndUpdate(
// 		toUser,
// 		{"userHours": foundUser[0].userHours + numHours,
// 		 $push : { "hoursHistory": {
// 		     "action" : logMessage,
// 		     "change" : numHours,
// 		     "newHours" :  foundUser[0].userHours + numHours
// 		 } }},
// 		function(err, updatedUser) {
// 		    if(err){
// 			// in general, this should not occur
// 			req.flash("error", "Something went wrong.");
// 			res.redirect("/offers");
// 		    } else {
// 			Escrow.remove({"offerResponseId" : req.params.id}, function(err, result) {
// 			    if (err) {
// 				req.flash("error", "Something went wrong.");
// 				res.redirect("/offers");
// 			    } else {
// 				req.flash("success", messageUponSuccess);
// 				/*res.render("showOfferResponse",
// 				  {"currentUser": req.user,
// 				  "offer": foundOffer,
// 				  "response": foundResponse,
// 				  "responderId": updatedResponder._id});*/
// 				res.redirect("/offers");
// 			    }
// 			});
// 		    }
// 		});
// 	}
//     });
// }

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;