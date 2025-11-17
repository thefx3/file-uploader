const supabase = require("../lib/supabase");
const FileModel = require('../models/fileModel');
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
      const filesRaw = req.user
        ? req.user.role === 'ADMIN'
          ? await FileModel.getAllFiles()
          : await FileModel.getFilesByUser(req.user.id)
        : [];
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

        const bucket = (process.env.SUPABASE_BUCKET || "").trim();
        if (!bucket) {
            return res.status(500).send("Storage bucket not configured.");
        }

        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
        if (req.file.size > MAX_FILE_SIZE_BYTES) {
            return res.status(400).send("File too large. Max 5 MB.");
        }

        const fileBuffer = fs.readFileSync(req.file.path);

        const now = new Date();
        const formattedDate = [
            String(now.getDate()).padStart(2, '0'),
            String(now.getMonth() + 1).padStart(2, '0'),
            now.getFullYear()
        ].join('-');

        const uniqueName = `${formattedDate} ${req.file.originalname}`;

        //1. Upload in Supabase
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueName, fileBuffer, {
                contentType: req.file.mimetype,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return res.status(500).send("Upload to cloud failed");
        }

        //2. Fetch public URL
        const { data: publicData, error: urlError } = supabase.storage
            .from(bucket)
            .getPublicUrl(uniqueName);
        if (urlError) {
            console.error("Supabase url error:", urlError);
            return res.status(500).send("Could not generate file URL");
        }

        await FileModel.createFile({
            filename: uniqueName,
            size: req.file.size,
            type: req.file.mimetype,
            url: publicData.publicUrl,
            userId: req.user.id,
        });

        console.log("REQ.FILE =", req.file);

        fs.unlinkSync(req.file.path);

        return res.redirect('/upload?success=1');
        } catch (error) {
            console.log(error);
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
        const isOwner = req.user.id === file.userId; 

        if (!isAdmin && !isOwner) {
            return res.status(403).send("Access denied.");
        } 
        
        return res.redirect(file.url);

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
        const isOwner = req.user.id === file.userId; 

        if (!isAdmin && !isOwner) {
            return res.status(403).send("Access denied.");
        }
        
        const bucket = (process.env.SUPABASE_BUCKET || "").trim();
        if (!bucket) {
            return res.status(500).send("Storage bucket not configured.");
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([file.filename]);
        if (error) {
            console.error("Supabase delete error:", error);
        }

        await FileModel.deleteFile(fileId);

        const referer = req.headers.referer || '/';
        const fallback = referer.includes('/upload') ? '/upload' : '/';
        return res.redirect(fallback);

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
