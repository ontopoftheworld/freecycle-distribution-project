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


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;