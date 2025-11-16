const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('../lib/db');
const { validPassword } = require('../lib/passwordUtils');

// -------- Local Strategy Function set up ---------------

const LocalFunction = async (email, password, done) => {
    try {
      const normalizedEmail = email?.trim();

      if (!normalizedEmail) {
        return done(null, false, { message: 'Email is required.' });
      }

      const result = await connection.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      const user = result.rows[0];
  
      if (!user) {
        return done(null, false, { message: 'User not found.' })
      };
  
      const isValid = validPassword(password, user.hash, user.salt);
  
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
  
    } catch (err) {
      return done(err);
    }
};
  
const strategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false,
  },
  LocalFunction,
);
passport.use(strategy);




// --------- Serialize user id when logged in ------------

passport.serializeUser((user, done) => {
    done(null, user.id)
});


// --------- Deserialize user id when logged out ---------

passport.deserializeUser(async (id, done) => {
    try {
      const result = await connection.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = result.rows[0];
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
});
