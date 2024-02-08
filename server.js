const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* Connect to MongoDB */
const mongoURI="mongodb+srv://02pratiksh:its a sunny day00@cluster0.ikywwba.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Define photo schema and model
const photoSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String
});
const Photo = mongoose.model("Photo", photoSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Passport configuration
passport.use(new LocalStrategy(
    function(username, password, done) {
        // Replace this with your actual authentication logic
        if (username === "user" && password === "password") {
            return done(null, { username: "user" });
        } else {
            return done(null, false, { message: "Incorrect username or password" });
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
    // Replace this with your actual user retrieval logic
    done(null, { username: username });
});

// Express session middleware
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static("public"));

// Handle file uploads
app.post("/upload", upload.single("photo"), (req, res) => {
    const newPhoto = new Photo({
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.file.path
    });
    newPhoto.save()
        .then(() => res.redirect("/"))
        .catch(err => res.status(400).send("Error uploading photo"));
});

// Get all photos
app.get("/photos", (req, res) => {
    Photo.find()
        .then(photos => res.json(photos))
        .catch(err => res.status(400).send("Error fetching photos"));
});

// Login route
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

// Logout route
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Routes
app.get("/", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.get("/gallery", isAuthenticated, (req, res) => {
    Photo.find()
        .then(photos => {
            res.render("gallery", { photos });
        })
        .catch(err => res.status(400).send("Error fetching photos"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
