require('dotenv').config();
console.log("Environment loaded:", process.env.DB_HOST, process.env.DB_DATABASE);

//Import of external modules
const path = require("node:path");
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');

//Import of local modules
const connection = require('./lib/db');

const routes = require('./routes');

//Config the local strategy for passport
require('./auth/passport');

//Initialize express app
const app = express();

//-------------- MIDDLEWARES --------------------------
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Set EJS as the templating engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

//-------------- SESSION SETUP ------------------------
app.use(
    session({
      store: new pgSession({
        pool: connection,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
      },
    })
  );

//-------------- PASSPORT AUTHENTICATION ----------------
app.use(passport.initialize());
app.use(passport.session());

// To make the user object available in all EJS templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use((req, res, next) => {
  res.locals.posts = req.posts || null;
  next();
})


//-------------- ROUTES ---------------------------------
app.use(routes);



// -------------- SERVER --------------------------------
 
const PORT = 3000;
(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ App listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
  }
})();


app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our custom error class and if it does not exist it's probably an internal server error
  res.status(err.statusCode || 500).send(err.message);
});

