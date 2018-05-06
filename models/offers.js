var mongoose    = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

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
    isActive: {type: Boolean, default: true},
    isAccepted: {type: Boolean, default: false},
    isCompleted: {type: Boolean, default: false},
    offerResponse: [
        {
            responder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            responseID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OfferResponse"
            }
        }
    ],
    location: String,
    type: String
});

offerSchema.plugin(mongoosePaginate);
offerSchema.index({title: 'text', desc: 'text'});
module.exports = mongoose.model("Offer", offerSchema);
