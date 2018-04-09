var mongoose    = require("mongoose");

var escrowSchema = new mongoose.Schema({
    hour: Number
});

module.exports = mongoose.model("Escrow", escrowSchema);