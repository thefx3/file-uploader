const { genPassword } = require('../auth/passwordUtils');
const UserModel = require('../models/userModel');
const { Prisma } = require('@prisma/client');

// -------------- CONTROLLERS ----------------

async function homePage(req, res) {
    try {
      const { loginError } = req.query;
      res.render("homepage", { loginError, user: req.user });

    } catch (error) {
      console.error("Error chargin homepage:", error);
      res.status(500).send("Internal Server Error");
    }
}

async function loginPage(req, res) {
    const { loginError} = req.query;
    res.render('login-page', { loginError, user: req.user });
}

function loginSuccess(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login');
    }
    return res.redirect('/');
}

async function loginFailure(req, res) {
    res.render('login-failure');
}

async function registerPage(req, res) {
    res.render('register-page', { user: req.user}); 
}

async function registerForm(req, res, next) {
    try {
        const { username, email, password  } = req.body;

        if (!username|| !email || !password) {
            return res.status(400).send('All the fields are required');
        }

        //Check if the email is not already used
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await UserModel.getUserByEmail(normalizedEmail);

        if (existingUser) {
          return res.status(409).send('This email is already used.');
        }

        const { hashedPassword } = genPassword(password);

        await UserModel.createUser(username, email, hashedPassword);

        return res.redirect('/login');

    } catch (err) {
        return next(err);
    }
}

function logoutPage(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                return next(sessionErr);
            }

            res.clearCookie('connect.sid');
            return res.redirect('/login');
        });
    });
}

module.exports = {
    homePage, 
    loginPage,
    loginSuccess,
    loginFailure,
    registerPage,
    registerForm,
    logoutPage
}
