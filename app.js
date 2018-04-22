var express         = require("express"),
    app             = express(),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local")
    path            = require("path");

var server = require('http').createServer(app);

var Offer           = require("./models/offers"),
    Request         = require("./models/requests"),
    User            = require("./models/users");
    Store           = require("./models/store");
    OfferResponse   = require("./models/offerResponse");

var indexRoutes =   require("./routes/index"),
    offerRoutes =   require("./routes/offers"),
    requestRoutes = require("./routes/requests"),
    storeRoutes =   require("./routes/store"),
    messagesRoutes = require("./routes/messages");
    userRoutes = require("./routes/users");
    accountRoutes =   require("./routes/account"),
    searchRoutes = require("./routes/search")

mongoose.connect("mongodb://localhost/timebank");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use('/static', express.static(path.join(__dirname, '/public')));
app.use(flash());

app.use(require("express-session")({
    secret: "! t1m3b@nk s3cr3t !",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(requestRoutes);
app.use(offerRoutes);
app.use(storeRoutes);
app.use(messagesRoutes);
app.use(userRoutes);
app.use(accountRoutes);
app.use(searchRoutes);

server.listen(8080, function(){
    console.log('- Server listening on port 8080');
});

// add socket.io for messages
var io = require('socket.io').listen(server);
var Messages = require("./models/messages");

io.sockets.on('connection', function(socket){
    // clients emit this when they join new rooms
    socket.on('join', function(cGrp, displayName, callback){
        socket.join(cGrp); // this is a socket.io method
        socket.displayName = displayName;
	socket.cGrp = cGrp;
    });

    // the client emits this when they want to send a message
    socket.on('message', function(messageU){
	// add the message to the database
	var date = new Date(); 
	var timeU = (date.getMonth()+1) + "/" +
	    date.getDate()  + "/" + date.getFullYear() + ", " +
	    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	console.log("socket.cGrp: " + socket.cGrp);
	console.log("MESSAGE: " +  messageU + "," + "TIME: " + timeU);
	Messages.find({chatGroup : socket.cGrp}, function(err, foundGrp){
	    console.log("FOUND: " + foundGrp);
	});
	Messages.update(
	    { "chatGroup" : socket.cGrp },
	    { $push : { "message" : { "sentBy" : socket.displayName,
				      "time" : timeU,
				      "info" : messageU }}},
	    { upsert : false, multi : true },
	    function (err, object) {
		if (err) {
		    console.log("ERROR: problems updating message");
		} 
	    }
	);
	
	// send the message to all users in the room
	io.sockets.in(socket.cGrp).emit('message', socket.displayName, timeU, messageU);
    });

    // the client disconnected/closed their browser window
    socket.on('disconnect', function(){
        // Leave the room!
	//io.sockets.in(socket.roomName).emit('memberLeft', socket.nickname);
    });

    // an error occured with sockets
    socket.on('error', function(){
        // Notify users that an error occured and log the error as well.
	io.sockets.in(socket.roomName).emit('error');
	console.log("ERROR: something went wrong");
    });

});
