var socket = io.connect();

// fired when the page has loaded
$(document).ready(function(){
    $("#messageList").scrollTop(function() { return this.scrollHeight; });
    
    // handle incoming messages
    socket.on('message', function(displayName, time, message){
	// display a newly-arrived message
	var newMessage = $('<div class="indivMessage"></div>');
	if (displayName === meta("userFirstName")) {
	    newMessage.html(time + "<br><b> You: </b>" +
			    message + "<br>");
	    $(newMessage).css("background-color", "dodgerblue");
	    $(newMessage).css("color", "white");
	    $(newMessage).css("margin-left", "25%");
	} else {
	    newMessage.html(time + "<br><b>" + displayName + ": </b>" +
			    message + "<br>");
	}
	$("#messageList").append(newMessage);
	$("#messageList").scrollTop(function() { return this.scrollHeight; });
    });

    socket.on('error', function() {
    });

    socket.emit('join', $("#chatId").html(), meta("userFirstName"));

    // user submits a new message
    $("#message").keypress(function(e) {
        if(e.which == 13) {
	    socket.emit('message', $("#message").val());
	    $("#message").val("");
	}
    });
    
    $("#submitButton").click(function(){
	socket.emit('message', $("#message").val());
	$("#message").val("");
    });
});

function meta(metaName) {
    return $('meta[name='+metaName+']').attr("content");
}
