var express         = require("express"),
    app             = express(),
    methodOverride  = require("method-override"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local")
    path            = require("path");
    
var Offer           = require("./models/offers"),
    Request         = require("./models/requests"),
    User            = require("./models/users");

var indexRoutes =   require("./routes/index"),
    offerRoutes =   require("./routes/offers"),
    requestRoutes = require("./routes/requests"),
    storeRoutes =   require("./routes/store");

mongoose.connect("mongodb://localhost/timebank");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, '/public')));

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
    next();
});

app.use(indexRoutes);
app.use(requestRoutes);
app.use(offerRoutes);
app.use(storeRoutes);

app.listen(8080, function(){
    console.log('- Server listening on port 8080');
});
