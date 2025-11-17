const { Router } = require("express");
const router = Router();
const passport = require('passport');

const authController = require("../controllers/authController");
const accountsController = require("../controllers/accountsController");
const uploadController = require("../controllers/uploadController");

// ----------- GET ROUTES --------------
router.get('/upload-page', accountsController.ensureAuthenticated, 
                           accountsController.isAdmin,
                           uploadController.uploadPage);


// ----------- POST ROUTES --------------
router.post('/upload', accountsController.ensureAuthenticated, 
                       accountsController.isAdmin,
                       uploadController.uploadForm);



module.exports = router;
