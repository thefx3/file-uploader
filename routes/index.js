const { Router } = require("express");
const router = Router();
const upload = multer({ dest: 'uploads/' })
const multer  = require('multer')

const authIndex = require('../routes/authIndex');

// ----------- GET ROUTES --------------
router.get('/', authIndex);
// ----------- POST ROUTES -------------


module.exports = router;