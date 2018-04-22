var mongoose    = require("mongoose");

var offerResponseSchema = new mongoose.Schema({
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer"
    },
    responder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    hours: Number,
    responseDate: { type: Date, default: Date.now },
    message: String,
    isAccepted: {type: Boolean, default: false},
    isComplete: {type: Boolean, default: false},
    status: {type: Boolean, default: false},
});

module.exports = mongoose.model("OfferResponse", offerResponseSchema);
