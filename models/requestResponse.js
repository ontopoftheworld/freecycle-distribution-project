var mongoose    = require("mongoose");

var requestResponseSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request"
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

module.exports = mongoose.model("RequestResponse", requestResponseSchema);
