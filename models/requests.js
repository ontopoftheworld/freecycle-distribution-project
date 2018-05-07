var mongoose    = require("mongoose");
var mongoose         = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var requestSchema = new mongoose.Schema({
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
    requestResponse: [
        {
            responder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            responseID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RequestResponse"
            }
        }
    ],
    location: String,
    type: String
});
    
requestSchema.plugin(mongoosePaginate);
requestSchema.index({title: 'text', desc: 'text'});
module.exports = mongoose.model("Request", requestSchema);
