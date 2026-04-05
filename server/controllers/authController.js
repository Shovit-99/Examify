const User = require('../models/User');
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
  const { name, email, password, role } = req.body;
  try {
    // Verify email matches the role
    if (!verifyEmailForRole(email, role)) {
      return res.status(400).json({ 
        message: `Email must contain the required domain for ${role} role. Student: @stu, Teacher: @teach, Admin: @sym` 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};