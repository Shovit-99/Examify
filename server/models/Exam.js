const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: [
      'Software Engineering',
      'Theory of Computation',
      'Advance Frontend',
      'Container Technologies',
      'Hydrogen Energy',
      'Technical Training'
    ]
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
  },
  courseCode: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: false,
    default: null
  },
  timeLimit: {
    type: Number, // in minutes
    required: false
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'paused'],
    default: 'scheduled'
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  pausedAt: {
    type: Date,
    default: null
  },
  pausedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  activeStudents: [{
    studentId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    startedAt: Date,
    lastActivityAt: Date
  }],
  totalAttempts: {
    type: Number,
    default: 0
  },
  submissionsReceived: {
    type: Number,
    default: 0
  },
  dateUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dateUpdatedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
