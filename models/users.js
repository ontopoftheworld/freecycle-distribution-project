var mongoose    = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    userHours: {type: Number, default: 0},
    isAdmin: {type: Boolean, default: false},
    password: String,
    dateJoined: { type: Date, default: Date.now },
    requests: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Request"
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

module.exports = mongoose.model("User", userSchema);
