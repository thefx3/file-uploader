const FileModel = require('../models/fileModel');

// -------------- CONTROLLERS ----------------

async function uploadPage(req, res) {
    try {
      const { loginError, success } = req.query;
      const files = req.user ? await FileModel.getFilesByUser(req.user.id) : [];
      res.render("upload-page", { loginError, user: req.user, files, uploadSuccess: success === '1' });

    } catch (error) {
      console.error("Error chargin uploadpage:", error);
      res.status(500).send("Internal Server Error");
    }
}

async function uploadForm(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const uniqueName = Date.now() + "-" + req.file.originalname;
        await FileModel.createFile({
            filename: uniqueName,
            path: req.file.path,
            type: req.file.mimetype,
            userId: req.user.id,
        });

        return res.redirect('/upload?success=1');
    } catch (error) {
        return next(error);
    }
}

async function listFiles(req, res, next) {
    try {
        const files = await FileModel.getAllFiles();
        return res.json(files);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    uploadPage,
    uploadForm,
    listFiles,
}
