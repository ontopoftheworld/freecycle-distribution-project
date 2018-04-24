var mongoose    = require("mongoose");

var escrowSchema = new mongoose.Schema({
    fromUser: String,
    toUser: String,
    hour: Number
});

module.exports = mongoose.model("Escrow", escrowSchema);
