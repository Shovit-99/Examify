const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  gradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  selectedOption: {
    type: String
  },
  isCorrect: {
    type: Boolean
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
