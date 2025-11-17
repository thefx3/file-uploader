const { genPassword } = require('../auth/passwordUtils');
const FileModel = require('../models/fileModel');
const { PrismaClient } = require('@prisma/client');

// -------------- CONTROLLERS ----------------

async function uploadPage(req, res) {
    try {
      const { loginError } = req.query;
      res.render("homepage", { loginError, user: req.user });

    } catch (error) {
      console.error("Error chargin homepage:", error);
      res.status(500).send("Internal Server Error");
    }
}

module.exports = {

}
