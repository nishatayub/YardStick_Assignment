const express = require('express');
const { signup, login, register } = require('../controllers/userController');
const router = express.Router();

router.post("/signup", signup);
router.post("/register", signup); // Alias for signup
router.post("/login", login);

module.exports = router;