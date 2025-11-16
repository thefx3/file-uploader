const { Router } = require("express");
const router = Router();
const passport = require('passport');

const authController = require("../controllers/authController");

// ----------- GET ROUTES --------------
router.get('/', authController.homePage); //Done in authController
router.get('/login', authController.loginPage); //Done in authController
router.get('/register', authController.registerPage); //Done in authController
router.get('/logout', authController.logoutPage); //Done in authController

router.get('/login-success', authController.loginSuccess); //Done in authController
router.get('/login-failure', authController.loginFailure);


// ----------- POST ROUTES --------------
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/login-success',
        failureRedirect: '/login?loginError=1'
    })
);
router.post('/register', authController.registerForm); //Done in authController


module.exports = router;
