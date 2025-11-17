const UserModel = require('../models/userModel');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/login');
}

function isAdmin (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login');
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send('Access denied. You dont have the authorized access.');
    }
    return next();
}

function isUser (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login');
    }
    if (req.user.role !== 'USER') {
        return res.status(403).send('Access denied. You dont have the authorized access.');
    }
    return next();
}

async function updateRole (req, res, next) {
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
