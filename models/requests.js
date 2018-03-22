var mongoose    = require("mongoose");

var requestSchema = new mongoose.Schema({
    title: String,
    desc: String
});

module.exports = mongoose.model("Request", requestSchema);