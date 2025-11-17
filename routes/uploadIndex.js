const { Router } = require("express");
const path = require("node:path");
const multer = require("multer");

const router = Router();

const uploadDir = path.join(__dirname, "..", "uploads");
const upload = multer({ dest: uploadDir });

const accountsController = require("../controllers/accountsController");
const uploadController = require("../controllers/uploadController");

// ----------- GET ROUTES --------------
router.get('/upload', accountsController.ensureAuthenticated, 
                      accountsController.isAdmin,
                      uploadController.uploadPage);
router.get('/files', accountsController.ensureAuthenticated,
                     accountsController.isUser,
                     uploadController.listFiles);
router.get('/download/:id', accountsController.ensureAuthenticated,
                            uploadController.downloadFile);



// ----------- POST ROUTES --------------
router.post('/upload', accountsController.ensureAuthenticated, 
                       accountsController.isAdmin,
                       upload.single('file'),
                       uploadController.uploadForm);
router.post('/delete/:id', accountsController.ensureAuthenticated,
                           uploadController.deleteFile);


module.exports = router;
