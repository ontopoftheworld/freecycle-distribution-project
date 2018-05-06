var express = require("express");
var router = express.Router();
var passport = require("passport");
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');
var AWS = require('aws-sdk');
var fileUpload = require('express-fileupload');
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json({extended:true}));
router.use(fileUpload());

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");
    Store = require("../models/store");

AWS.config.loadFromPath('./config.json');
var s3Bucket = new AWS.S3({params:{Bucket: "freecycle-distribution-project-storeimg"}});
var baseAWSURL ="https://s3.amazonaws.com/freecycle-distribution-project-storeimg/";
// Store routes:

router.get("/store", isLoggedIn, function(req, res) {
    Store.find({"status":false}, function(err, allItems){
        if(err){
            console.log(err);
        } else {
            res.render("store", {items: allItems} );
        }
    });
});
router.post("/store/soldItems", isLoggedIn, function(req, res) {
	console.log("pickup");
	var itemId=req.body.itemId;
	Store.findByIdAndUpdate(itemId, {"isPickedUp": true}, function(err){
                                if (err) {  
                                    console.error(err);  
                                }else{
                                	res.redirect("/store/soldItems");
                                }
});
});

router.get("/store/soldItems", isLoggedIn, function(req, res) {
    Store.find({"status":true}, function(err, allItems){
        if(err){
            console.log(err);
        } else {
            res.render("storePastPurchases", {items: allItems} );
        }
    });
});

router.post("/store/buy",isLoggedIn, function(req,res){
        var buyerId=req.body.buyerId;
        var sellerId=req.body.sellerId;
        var itemId=req.body.itemId;
        var itemPrice=Number(req.body.itemPrice);

        User.findById(buyerId,function(err, buyer){
            if (err) {
                console.log(err);
            }else{
                var buyerCurrentHour=Number(buyer.userHours);
                if (buyerCurrentHour>=itemPrice) {
                    var buyerUpdateHour=buyerCurrentHour - itemPrice;
                    Store.findById(itemId,function(err, item){
                        if (item.status==false) {
                            Store.findByIdAndUpdate(itemId, {"status": true, "buyerId": buyerId}, function(err){
                                if (err) {  
                                    console.error(err);  
                                } else {  
                                    User.findByIdAndUpdate(
					buyerId, {"userHours": buyerUpdateHour,
						  $push : { "hoursHistory": {
						      "action" : "You bought an item (" + item.title + 
							  ", id: " + item._id + ") from the store.",
						      "change" : (-1 * itemPrice),
						      "newHours" : buyerUpdateHour
						  }}},function(err){
						      if (err) {  
							  console.error(err);  
						      }
						  });
				    User.findById(sellerId,function(err, seller){
					if (err) {
                                            console.log(err);
					}else{
					    var sellerCurrentHour=Number(seller.userHours);
					    var sellerUpdateHour=sellerCurrentHour + itemPrice;
					    User.findByIdAndUpdate(
						sellerId, {"userHours": sellerUpdateHour,
							   $push : { "hoursHistory": {
							       "action" : "You sold an item (" + item.title + 
								   ", id: " + item._id + ") in the store.",
							       "change" : itemPrice,
							       "newHours" : sellerUpdateHour
							   }}},
						function(err){
						    if (err) {  
							console.error(err);  
						    }else{
							createNewMessageForSeller(req, res, sellerId, seller.username,
										  buyerId, buyer, item);
						    }
						});
					}
				    });
                                }
                            });
                        }else{
                            req.flash("error", "Unfortunately this item has already bought buy others.");
                            res.redirect('/store/'+itemId);
                        }
                    });
                }else{
                    req.flash("error", "Unfortunately you do not have enough hours to buy this item.");
                    res.redirect('/store/'+itemId);
                }
            }
        });
});

var Messages = require("../models/messages");

function createNewMessageForSeller(req, res, toUserId, toUserName, buyerId, buyer, item) {
    Messages.find({"$or" : [{"$and": [{"senderA.id" : toUserId},
				      {"senderB.id" : buyerId}]},
			    {"$and": [{"senderA.id" : buyerId},
				      {"senderB.id" : toUserId}]}]},
		  function (err, foundChat) {
		      if (foundChat !== undefined && foundChat.length !== 0) {
			  // previous conversation exists
			  let cGrp = foundChat[0].chatGroup;

			  // change the current user's seen status to true, so that the message
			  // can be marked as read, and the other user's seen status as false
			  if (foundChat[0].senderA.displayName === buyer.username) {
			      console.log("here");
			      Messages.update(
				  { "chatGroup" : cGrp },
				  { $set : { "senderA.seenMessages" : true,
					     "senderB.seenMessages" : false }},
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
				  { $set : { "senderB.seenMessages" : true,
					     "senderA.seenMessages" : false }},
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
				  "info" : "Hi " + toUserName + ", the user (" + buyer.username +
				      ", id:" + buyerId + ") " +
				      "just bought an item (" +
				      item.title + ", id:" + item._id + ") from your store."}}},
			      { upsert : false, multi : true },
			      function (err, object) {
				  if (err) {
				      console.log("ERROR: problems updating message");
				  } else {
				  		req.flash("success", "Trading success");
                        res.render('pickupLocation', {location:item.location});
				  }
			      }
			  );
		      } else {
			  // create new chatgroup
			  var cGrp = require('crypto').createHash('md5')
			      .update(buyerId + "" + toUserId).digest("hex");
			  var newChat = {message: [],
					 chatGroup: cGrp,
					 senderA: { id : buyerId,
						    displayName : buyer.username,
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
					  "info" : "Hi " + toUserName + ", the user (" + buyer.username +
					      ", id:" + buyerId + ") " +
					      "just bought an item (" +
					      item.title + ", id:" + item._id + ") from your store."}}},
				      { upsert : false, multi : true },
				      function (err, object) {
					  if (err) {
					      console.log("ERROR: problems updating message");
					  } else {
					      req.flash("success", "Trading success");
					      res.render('pickupLocation');
					  }
				      }
				  );
			      }
			  });
		      }
		  });
}


router.get("/store/new", isLoggedIn, function(req, res) {
    res.render("newStoreItem");
});



router.post("/store", isLoggedIn, function(req, res) {
    if (req.user.isAdmin || req.user.isSAdmin) {
        var imgname=req.body.title + "_" + Date.now();
        let uploadData = {
        Key: imgname,
        Body: req.files.upload.data,
        ContentType: req.files.upload.mimetype,
        ACL: 'public-read'
        }

        s3Bucket.putObject(uploadData, function(err, data){
            if (err) {
                console.log(err);
                return;
            }
        });
        User.findById(req.user._id, function(err, user){
            if(err){
                console.log(err);
            } else {
                var title = req.body.title;
                var desc = req.body.desc;
                var author = {
                    id: req.user._id,
                    username: req.user.username
                }
                var location = req.body.location;
                var hourPrice = req.body.hourPrice;
                var category = req.body.category;
                var condition = req.body.condition;
                var newItem = {title: title, desc: desc, author: author,
			       location: location, hourPrice: hourPrice,
			       category: category, condition: condition,
			       imgname:imgname};
                Store.create(newItem, function(err, newI) {
                    if(err){
                        console.log(err);
                        res.render("newStoreItem");
                    } else {
                        res.render("redirect");
                    }
                });
            }
        });
    } else {
        res.redirect("back");
    }
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

function updateTransactionHistory(req, storeItem, buyer, finalHrs, res) {
    User.findByIdAndUpdate(
	buyer, {$push : { "hoursHistory": {
	    "action" : "You bought an item from the store.",
	    "change" : (-1 * storeItem.hours),
	    "newHours" : finalHrs
	} }},
	function(err, updatedBuyer) {});
}
