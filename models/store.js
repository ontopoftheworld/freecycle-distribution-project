var mongoose    = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var storeSchema = new mongoose.Schema({
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
    hourPrice: Number,
    category: String,
    condition: String,
    imgname: String,
    status: {type: Boolean, default: false},
    location: String,
    buyerId: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
    },
    isPickedUp: {type: Boolean, default: false}
});


storeSchema.plugin(mongoosePaginate);
storeSchema.index({title: 'text', desc: 'text'});
module.exports = mongoose.model("Store", storeSchema);
