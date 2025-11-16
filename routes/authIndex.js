const { Router } = require("express");
const router = Router();
const passport = require('passport');

const authController = require("../controllers/authController");
const accountsController = require("../controllers/accountsController");

// ----------- GET ROUTES --------------
router.get('/', authController.homePage);
router.get('/login', authController.loginPage);
router.get('/register', authController.registerPage);
router.get('/logout', authController.logoutPage);

router.get('/login-success', authController.loginSuccess);
router.get('/login-failure', authController.loginFailure);


// ----------- POST ROUTES --------------
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/login-success',
        failureRedirect: '/login?loginError=1'
    })
);
router.post('/register', authController.registerForm);
router.post('/update-role', accountsController.updateRole);



module.exports = router;
