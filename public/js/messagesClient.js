var socket = io.connect();

// fired when the page has loaded
$(document).ready(function(){
    // handle incoming messages
    socket.on('message', function(displayName, time, message){
	// display a newly-arrived message
	var newMessage = $('<div class="indivMessage"></div>');
	newMessage.html(time + "<br><b>" + displayName + ": </b>" +
			message + "<br>");
	$("#messageList").append(newMessage);
	window.scrollTo(0, document.body.scrollHeight);
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
