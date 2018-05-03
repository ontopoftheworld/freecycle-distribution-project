var mongoose    = require("mongoose");

var escrowSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    hours: Number,
    offerResponseId: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "OfferResponse"
    },
    requestResponseId: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "RequestResponse"
    }
});

module.exports = mongoose.model("Escrow", escrowSchema);
