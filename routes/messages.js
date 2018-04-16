var express = require("express");
var router = express.Router();
var passport = require("passport");
var server = global.server;
var currentUserId;

var Messages = require("../models/messages"),
    Request = require("../models/requests"),
    User = require("../models/users");

router.get("/messages", isLoggedIn, function(req, res) {
    currentUserId = req.user._id;
    Messages.find({"$or": [{"senderA.id" : currentUserId},
			   {"senderB.id" : currentUserId}]}, function(err, foundMessages){
        if(err){
            console.log(err);
        } else {
	    // If there is an existing chat
            res.render("messagesHome", {thisUserDisplayName: req.user.firstName, allMessages: foundMessages} );
        }
    });
});

router.post("/messages", isLoggedIn, function(req, res) {
    User.find({"username": req.body.message.toUser}, function(err, foundUser){
	if(err){
	    console.log(err);
	} else {
	    if (foundUser === undefined || foundUser.length === 0) {
		console.log("notFound");
		res.redirect("/messages");
	    } else {
		var toUserId = foundUser[0]._id;
		Messages.find({"$or" : [{"$and": [{"senderA.id" : req.user._id},
						  {"senderB.id" : toUserId}]},
					{"$and": [{"senderA.id" : toUserId},
						  {"senderB.id" : req.user._id}]}]},
			      function (err, foundChat) {
				  if (foundChat !== undefined && foundChat.length !== 0) {
				      res.redirect("/messages/"+foundChat[0].chatGroup);
				  } else {
				      // create new chatgroup
				      var chatGrpHashed = require('crypto').createHash('md5')
					  .update(req.user._id + "" + toUserId).digest("hex");
				      var newChat = {message: [],
						     chatGroup: chatGrpHashed,
						     senderA: { id : req.user._id,
								displayName : req.user.firstName },
						     senderB: { id : toUserId,
							        displayName : foundUser[0].firstName }};
				      Messages.create(newChat, function(err, newM) {
					  if(err){
					      console.log(err);
					  } else {
					      //user.offers.push(newM);
					      //user.save();
					      res.redirect("/messages/"+chatGrpHashed);
					  }
				      });
				  }
			      });
	    }
	}
    });
});

router.get("/messages/:chatGroup", isLoggedIn, function(req, res) {
    var cGrp = req.params.chatGroup;
    Messages.find({"chatGroup" : cGrp}, function(err, foundGrp){
        if(err){
            console.log(err);
        } else {
	    // If there is an existing chat
            res.render("messages", {chatId: cGrp, messages: foundGrp[0].message} );
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
