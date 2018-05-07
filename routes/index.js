var express = require("express");
var router = express.Router();
var passport = require("passport");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

var Offer = require("../models/offers"),
    Request = require("../models/requests"),
    User = require("../models/users");

// Index routes:

// Landing page
router.get("/", isLoggedOut, function(req, res){
    res.render("landing");
});

// Home page
router.get("/home", isLoggedIn, function(req, res){
    User.findById(req.user._id, function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            Offer.find({"isAccepted": false, "isActive": true}, function(err, allOffers){
                if(err){
                    console.log(err);
                } else {
                    Request.find({}, function(err, allRequests){
                        if(err){
                            console.log(err);
                        } else {
                            res.render("home", {offers: allOffers, requests: allRequests, user: foundUser} );
                        }
                    });
                }
            });
        }
    });
});

// *** Authentication Routes ***

// Register
router.get("/register", isLoggedOut, function(req, res){
    res.render("register");
});

router.post("/register", isLoggedOut, function(req, res) {
    var bool = false;
    if (req.body.username === "admin") {
        bool = true;
    }
    var newUser = new User({username: req.body.username,
                firstName: req.body.firstName, 
                lastName: req.body.lastName,
                email: req.body.email,
			    ipAddress: req.connection.remoteAddress,
			    hoursHistory:   [ {   action: "Joined",
					                change: 0,
                                    newHours: 0
                                } ],
                isAdmin: bool
            });
    User.register(newUser, req.body.password, function(err, user) {
        if(err){
            console.log(err.message);
            if (err.message.substring(0,68) === "E11000 duplicate key error collection: timebank.users index: email_1") {
                req.flash("error", "An account is already registered with that email.");
                res.redirect("register");
            } else {
                req.flash("error", err.message);
                res.redirect("register");
            }
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/home")
        });
    });
});

// Login
router.get("/login", isLoggedOut, function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {successRedirect: "/home", failureRedirect: "/login"}), 
    function(req, res) {
});

// Logout
router.get("/logout", isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out");
    res.redirect("/");
});

// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
  });
  
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'freecycledistributionproject@gmail.com',
            pass: 'freecycle123distribution321project!'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'freecycledistributionproject@gmail.com',
          subject: 'FDP Time Exchange Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'freecycledistributionproject@gmail.com',
            pass: 'freecycle123distribution321project!'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'freecycledistributionproject@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/home');
    });
  });
  

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function isLoggedOut(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect("/home");
    } else {
        return next();
    }
}

module.exports = router;
