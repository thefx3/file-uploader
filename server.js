require('dotenv').config();
console.log("Environment loaded:", process.env.DB_HOST, process.env.DB_DATABASE);

//Import of external modules
const path = require("node:path");
const express = require('express');



const session = require('express-session');

const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');

//Import of local modules
const connection = require('./lib/db');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

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

// Using PrismaSessionStore store sessions in a database via Prisma
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
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
