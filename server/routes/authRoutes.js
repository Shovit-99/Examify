const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');

// Define the endpoints
router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;