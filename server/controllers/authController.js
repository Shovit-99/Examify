const User = require('../models/User');
const RegistrationCode = require('../models/RegistrationCode');
const jwt = require('jsonwebtoken');

// Helper function to generate the secure token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper function to verify email against role
const verifyEmailForRole = (email, role) => {
  if (role === 'student' && !email.includes('@stu')) {
    return false;
  }
  if (role === 'teacher' && !email.includes('@teach')) {
    return false;
  }
  if (role === 'admin' && !email.includes('@sym')) {
    return false;
  }
  return true;
};

// --- 1. REGISTER USER ---
exports.registerUser = async (req, res) => {
  const { name, email, password, role, subject, registrationCode } = req.body;
  try {
    // Verify email matches the role
    if (!verifyEmailForRole(email, role)) {
      return res.status(400).json({ 
        message: `Email must contain the required domain for ${role} role. Student: @stu, Teacher: @teach, Admin: @sym` 
      });
    }

    // SECURITY: Verify registration code for teachers
    if (role === 'teacher') {
      if (!registrationCode) {
        return res.status(400).json({ 
          message: 'Teacher registration code is required' 
        });
      }

      const code = await RegistrationCode.findOne({
        code: registrationCode.toUpperCase(),
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!code) {
        return res.status(400).json({ 
          message: 'Invalid, expired, or already used registration code' 
        });
      }

      // Subject from code must match the requested subject
      if (code.subject !== subject) {
        return res.status(400).json({ 
          message: `Registration code is for ${code.subject} subject only` 
        });
      }
    }

    // Verify subject is provided for teachers
    if (role === 'teacher' && !subject) {
      return res.status(400).json({ 
        message: 'Subject is required for teacher registration' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, subject });
    
    if (user) {
      // Mark registration code as used
      if (role === 'teacher') {
        await RegistrationCode.findOneAndUpdate(
          { code: registrationCode.toUpperCase() },
          { isUsed: true, usedBy: user._id, usedAt: new Date() }
        );
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LOGIN USER ---
exports.authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // matchPassword is the custom method we added to the User Model
    if (user && (await user.matchPassword(password))) {
      // Verify email matches the user's role
      if (!verifyEmailForRole(email, user.role)) {
        return res.status(401).json({ message: 'Email domain does not match your role' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};