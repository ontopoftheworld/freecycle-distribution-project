var mongoose    = require("mongoose");
var mongoose         = require('mongoose');
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
    isActive: {type: Boolean, default: false},
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
    ]
});

offerSchema.plugin(mongoosePaginate);
offerSchema.index({title: 'text'});
module.exports = mongoose.model("Offer", offerSchema);
