const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createRegistrationCode,
  getRegistrationCodes,
  revokeRegistrationCode,
  verifyRegistrationCode
} = require('../controllers/registrationCodeController');

// Public: Verify registration code (teachers need this)
router.post('/verify', verifyRegistrationCode);

// Admin only: Create registration codes
router.post('/create', protect, admin, createRegistrationCode);

// Admin only: Get all registration codes
router.get('/', protect, admin, getRegistrationCodes);

// Admin only: Revoke a registration code
router.delete('/:id', protect, admin, revokeRegistrationCode);

module.exports = router;
