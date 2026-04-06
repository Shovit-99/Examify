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
    required: true,
    enum: [
      'Dr. Deekshant Semwal',
      'Dr. Jigyasa Arora',
      'Dr. Sunil Ghlidiyal',
      'Dr. Garima Verma',
      'Dr. Abhishek',
      'Mr. Amit Srivastava'
    ]
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
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
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
