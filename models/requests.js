var mongoose    = require("mongoose");

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
    status: {type: Boolean, default: false}
});

requestSchema.index({title: 'text'});

module.exports = mongoose.model("Request", requestSchema);