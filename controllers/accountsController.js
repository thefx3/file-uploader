const UserModel = require('../models/userModel');

function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        next();
    }
    return true;
}

function isAdmin (req, res) {
    if (!req.isAuthenticated() || req.user.role !== 'ADMIN') {
        res.status(403).send('Access denied. You dont have the authorized access.');
        return false;
    }
    return true;
}

function isUser (req, res) {
    if (!req.isAuthenticated() || req.user.role !== 'USER') {
        res.status(403).send('Access denied. You dont have the authorized access.');
        return false;
    }
    return true;
}

async function updateRole (req, res, next) {
    if (!ensureAuthenticated(req, res)) {
        return;
    }

    try {
        const userId = req.user.id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).send('Role is required.');
        }

        const normalizedRole = role.toUpperCase();
        const allowedRoles = ['ADMIN', 'USER', 'GUEST'];

        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(400).send('Invalid role.');
        }

        if (normalizedRole === req.user.role) {
            return res.redirect('back');
        }

        await UserModel.updateUserRole(userId, normalizedRole);
        req.user.role = normalizedRole;
        return res.redirect('/');
    } catch (error) {
        return next(error);
    }
 }


module.exports = {
    ensureAuthenticated,
    isAdmin,
    isUser,
    updateRole
}
