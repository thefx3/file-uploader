const FileModel = require('../models/fileModel');
const path = require("node:path");
const fs = require("node:fs");
const { isUser, isAdmin } = require('./accountsController');

function formatFileSize(bytes) {
    if (bytes === null || bytes === undefined) return '—';
    const kb = 1024;
    const mb = kb * 1024;
    if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`;
    if (bytes >= kb) return `${(bytes / kb).toFixed(1)} KB`;
    return `${bytes} B`;
}

// -------------- CONTROLLERS ----------------

async function uploadPage(req, res) {
    try {
      const { loginError, success } = req.query;
      const filesRaw = req.user ? await FileModel.getFilesByUser(req.user.id) : [];
      const files = filesRaw.map(f => ({ ...f, displaySize: formatFileSize(f.size) }));
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
            size: req.file.size,
            path: req.file.path,
            type: req.file.mimetype,
            userId: req.user.id,
        });
        console.log("REQ.FILE =", req.file);

        return res.redirect('/upload?success=1');
    } catch (error) {
        return next(error);
    }
}

async function listFiles(req, res, next) {
    try {
        const files = await FileModel.getAllFiles();
        const withSize = files.map(f => ({ ...f, displaySize: formatFileSize(f.size) }));
        return res.json(withSize);
    } catch (error) {
        return next(error);
    }
}


async function downloadFile(req, res, next) {
    try {
        const fileId = parseInt(req.params.id, 10);
        const file = await FileModel.getFileById(fileId);

        if (!file) {
            return res.status(404).send("File not found.");
        }

        const isAdmin = req.user.role === "ADMIN";
        const isUser = req.user.role === "USER";
        const isOwner = req.user.id === file.userId; 

        if ((isUser && !isOwner)||(!isAdmin)) {
            return res.status(403).send("Access denied.");
        } 
        
        const absolutePath = file.path;

        if (!fs.existsSync(absolutePath)) {
            console.log("Missing file:", absolutePath);
            return res.status(404).send('File has been removed from server');
        }

        return res.download(absolutePath, file.filename);

    } catch (error) {
        return next(error);
    }
}

async function deleteFile(req, res, next) {
    try {
        const fileId = parseInt(req.params.id, 10);
        const file = await FileModel.getFileById(fileId);

        if (!file) {
            return res.status(404).send("File not found.");
        }

        const isAdmin = req.user.role === "ADMIN";
        const isUser = req.user.role === "USER";
        const isOwner = req.user.id === file.userId; 

        if (!isAdmin && !isOwner) {
            return res.status(403).send("Access denied.");
        }
        
        const absolutePath = file.path;
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        await FileModel.deleteFile(fileId);

        return res.redirect('/upload');

    } catch (error) {
        return next(error);
    }
}


module.exports = {
    uploadPage,
    uploadForm,
    listFiles,
    downloadFile,
    deleteFile
}
