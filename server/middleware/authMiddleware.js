const jwt = require('jsonwebtoken');
const User = require('../models/User');

// BOUNCER 1: Are you logged in? (Checks the JWT Token)
const protect = async (req, res, next) => {
  let token;

  // Check if the request has an authorization header starting with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach them to the request object (minus the password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Success! Move on to the next function
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// BOUNCER 2: Are you an Admin? (Checks the Role)
// NOTE: This must ALWAYS run *after* the 'protect' middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // They have the right role, let them through!
  } else {
    res.status(403).json({ message: 'Access denied. Admin clearance required.' });
  }
};

// BOUNCER 3: Are you a Teacher? (Checks the Role)
// NOTE: This must ALWAYS run *after* the 'protect' middleware
const teacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next(); // They have the right role, let them through!
  } else {
    res.status(403).json({ message: 'Access denied. Teacher clearance required.' });
  }
};

// BOUNCER 4: Are you an Admin or Teacher?
// NOTE: This must ALWAYS run *after* the 'protect' middleware
const adminOrTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    next(); // They have the right role, let them through!
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Teacher clearance required.' });
  }
};

module.exports = { protect, admin, teacher, adminOrTeacher };