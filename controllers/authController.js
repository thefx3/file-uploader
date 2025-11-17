const { genPassword } = require('../auth/passwordUtils');
const UserModel = require('../models/userModel');
const FileModel = require('../models/fileModel');
const { PrismaClient } = require('@prisma/client');

// -------------- CONTROLLERS ----------------

async function homePage(req, res) {
    try {
      const { loginError } = req.query;
      const filesRaw = req.user ? await FileModel.getAllFiles():[];

      const files = filesRaw.map(f => {
        const kb = 1024;
        const mb = kb * 1024;
        const formatSize = f.size === null || f.size === undefined
          ? '—'
          : f.size >= mb
            ? `${(f.size / mb).toFixed(2)} MB`
            : f.size >= kb
              ? `${(f.size / kb).toFixed(1)} KB`
              : `${f.size} B`;
        return { ...f, displaySize: formatSize };
      });

      res.render("homepage", { loginError, user: req.user, files });

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
    return res.redirect('/');
}

async function loginFailure(req, res) {
    res.render('login-failure');
}

async function registerPage(req, res) {
    const { registerError } = req.query;
    res.render('register-page', { user: req.user, registerError }); 
}

async function registerForm(req, res, next) {
    try {
        const { username, email, password  } = req.body;

        if (!username|| !email || !password) {
            return res.redirect('/register?registerError=missing');
        }

        //Check if the email is not already used
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        const existingUser = await UserModel.getUserByEmail(normalizedEmail);
        const existingUser2 = await UserModel.getUserByUsername(normalizedUsername);

        if (existingUser) {
          return res.redirect('/register?registerError=email');
        }

        if (existingUser2) {
          return res.redirect('/register?registerError=username');
        }

        const hashedPassword = await genPassword(password);

        await UserModel.createUser({
          username: normalizedUsername,
          email: normalizedEmail,
          password: hashedPassword,
        });

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
