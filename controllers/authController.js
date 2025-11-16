const queries = require('../lib/queries');
const { genPassword } = require('../auth/passwordUtils');
const UserModel = require('../models/userModel');

// -------------- CONTROLLERS ----------------

async function homePage(req, res) {
    try {
      const rawPosts = await queries.getAllPosts();
      const isLoggedIn = Boolean(req.user);
  
      const formatDate = (value) =>
        value
          ? new Date(value).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Unknown date";

      const posts = rawPosts.map((p) => {
        if (isLoggedIn) {
          return {
            idpost: p.idpost,
            iduser: p.iduser,
            email: p.email,
            title: p.title || "Untitled",
            content: p.content || "No content available.",
            author: p.author || "Anonymous",
            date: formatDate(p.created_at),
          };
        } else {
          return {
            idpost: p.idpost,
            iduser: null,
            email: null,
            title: "Unavailable Title",
            content: p.content,
            author: "Member of the community",
            date: "Unavailable date",
          };
        }
      });
  
      res.render("homepage", {
        posts,
        user: req.user || null,
        isLoggedIn,
        loginError: req.query?.loginError || null,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
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
        const { firstname, lastname, email, password  } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).send('All the fields are required');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await queries.findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).send('This email is already used.');
        }

        const { salt, hash } = genPassword(password);

        await queries.addNewUser(firstname, lastname, normalizedEmail, hash, salt);

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
