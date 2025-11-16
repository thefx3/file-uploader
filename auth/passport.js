const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validPassword } = require('../auth/passwordUtils');

// -------- Local Strategy Function ---------------

const LocalFunction = async (email, password, done) => {
    try {
      const normalizedEmail = email?.trim();

      // 1. Get user from Prisma
      const user = await prisma.user.findUnique({
        where: {
          email: { normalizedEmail }
        }
      })
  
      if (!user) {
        return done(null, false, { message: 'User not found.' })
      };
  
      // 2. Validate password using bcrypt
      const isValid = validPassword(password, user.password)
  
      if (!isValid) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
  
    } catch (err) {
      return done(err);
    }
};
  

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: false,
    },
    LocalFunction,
  )
);

// --------- Serialize user id when logged in ------------

passport.serializeUser((user, done) => {
    done(null, user.id)
});


// --------- Deserialize user id when logged out ---------

passport.deserializeUser(async (id, done) => {
    try {

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
});
