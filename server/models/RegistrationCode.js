const mongoose = require('mongoose');

const registrationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 6
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
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index to find non-expired, unused codes
registrationCodeSchema.index({ isUsed: 1, expiresAt: 1 });

module.exports = mongoose.model('RegistrationCode', registrationCodeSchema);
