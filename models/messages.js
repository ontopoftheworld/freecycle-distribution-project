var mongoose    = require("mongoose");

var messageSchema = new mongoose.Schema({
    message: [{ sentBy : String,
		time : String,
	        info : String } ],
    chatGroup: String,
    senderA: {
	id: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	},
	displayName : String,
	seenMessages : Boolean
    },
    senderB: {
	id: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	},
	displayName : String,
	seenMessages : Boolean
    }
});

module.exports = mongoose.model("Message", messageSchema);
