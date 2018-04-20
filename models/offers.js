var mongoose    = require("mongoose");

var offerSchema = new mongoose.Schema({
    title: String,
    desc: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    postDate: { type: Date, default: Date.now },
    hoursOffered: Number,
    category: String,
    status: {type: Boolean, default: false},
    offerResponse: [
        {
            responder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            message: String,
            isAccepted: {type: Boolean, default: false},
            isComplete: {type: Boolean, default: false},
        }
    ]
});
offerSchema.index({title: 'text'});
module.exports = mongoose.model("Offer", offerSchema);
