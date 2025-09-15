const express = require('express');
const { signup, login, register, inviteUser } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const router = express.Router();

router.post("/signup", signup);
router.post("/register", register);
router.post("/login", login);
router.post("/invite", authenticateToken, requireAdmin, inviteUser);

module.exports = router;