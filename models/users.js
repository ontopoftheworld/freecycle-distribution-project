var mongoose    = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
	hometown: {type: String, default: "Incomplete"},
	zipcode:  {type: String, default: "Incomplete"},
	userbio: {type: String, default: "Incomplete"},
    userHours: {type: Number, default: 100},
    isAdmin: {type: Boolean, default: false},
    isSAdmin:{type: Boolean, default: false}, 
    password: String,
    dateJoined: { type: Date, default: Date.now },
    requests: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Request"
        }
    ],
    requestResponse: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RequestResponse"
        }
    ],
    offers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer"
        }
    ],
    offerResponse: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OfferResponse"
        }
    ],
    ipAddress: String,
    hoursHistory: [ { date: {type: Date, default: Date.now},
		      action: String,
		      change: Number,
		      newHours: Number } ]
});

userSchema.plugin(passportLocalMongoose);
userSchema.index({username: 'text', firstName: 'text', lastName: 'text'});
module.exports = mongoose.model("User", userSchema);
