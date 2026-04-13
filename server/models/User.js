const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'teacher'], 
    default: 'student' 
  },
  subject: {
    type: String,
    enum: [
      'Software Engineering',
      'Theory of Computation',
      'Advance Frontend',
      'Container Technologies',
      'Hydrogen Energy',
      'Technical Training'
    ],
    required: function() { return this.role === 'teacher'; }
  },
  instructor: {
    type: String,
    enum: [
      'Dr. Deekshant Semwal',
      'Dr. Jigyasa Arora',
      'Dr. Sunil Ghlidiyal',
      'Dr. Garima Verma',
      'Dr. Abhishek',
      'Mr. Amit Srivastava'
    ],
    default: null
  }
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);