var mongoose    = require("mongoose");

var offerSchema = new mongoose.Schema({
    title: String,
    desc: String
});

module.exports = mongoose.model("Offer", offerSchema);
