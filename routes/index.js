const { Router } = require("express");
const router = Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const authIndex = require('../routes/authIndex');

// ----------- GET ROUTES --------------
router.get('/', authIndex);
// ----------- POST ROUTES -------------


module.exports = router;
