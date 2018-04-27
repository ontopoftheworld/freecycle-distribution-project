var mongoose    = require("mongoose");

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
    status: {type: Boolean, default: false}
});

module.exports = mongoose.model("Store", storeSchema);