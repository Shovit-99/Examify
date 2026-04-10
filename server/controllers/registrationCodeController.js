const RegistrationCode = require('../models/RegistrationCode');
const User = require('../models/User');

// Generate a random code
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Admin: Create registration codes for teachers
exports.createRegistrationCode = async (req, res) => {
  try {
    const { subject, expiryDays = 30 } = req.body;

    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existing = await RegistrationCode.findOne({ code });
      if (!existing) isUnique = true;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const registrationCode = new RegistrationCode({
      code,
      subject,
      expiresAt,
      createdBy: req.user.id
    });

    await registrationCode.save();

    res.status(201).json({
      message: 'Registration code created successfully',
      code: code,
      subject,
      expiresAt,
      expiryDays
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: Get all registration codes
exports.getRegistrationCodes = async (req, res) => {
  try {
    const codes = await RegistrationCode.find()
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Revoke a registration code (before use)
exports.revokeRegistrationCode = async (req, res) => {
  try {
    const code = await RegistrationCode.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: 'Registration code not found' });
    }

    if (code.isUsed) {
      return res.status(400).json({ message: 'Cannot revoke code that has already been used' });
    }

    await RegistrationCode.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Registration code revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public: Verify registration code (for teachers during registration)
exports.verifyRegistrationCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Registration code is required' });
    }

    const registrationCode = await RegistrationCode.findOne({
      code: code.toUpperCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!registrationCode) {
      return res.status(400).json({
        message: 'Invalid, expired, or already used registration code'
      });
    }

    res.status(200).json({
      message: 'Code is valid',
      valid: true,
      subject: registrationCode.subject
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
