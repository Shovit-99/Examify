const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, teacher, admin } = require('../middleware/authMiddleware');
const {
  getExamQuestions,
  getSingleQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
  submitExamAnswers,
  getQuestionCount,
  uploadPDFQuestions,
  saveBulkQuestions
} = require('../controllers/questionController');

// Configure multer for PDF upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Student routes - Get questions for exam
router.get('/exam/:examId', protect, getExamQuestions);
router.get('/single/:questionId', protect, getSingleQuestion);
router.get('/count/:examId', protect, getQuestionCount);

// Student - Submit exam answers
router.post('/submit', protect, submitExamAnswers);

// Teacher routes - Create/Update/Delete questions
router.post('/create', protect, teacher, createQuestion);
router.put('/:questionId', protect, teacher, updateQuestion);
router.delete('/:questionId', protect, teacher, deleteQuestion);
router.delete('/exam/:examId/all', protect, teacher, deleteAllQuestions);

// Teacher - PDF Upload routes
router.post('/upload-pdf', protect, teacher, upload.single('pdf'), uploadPDFQuestions);
router.post('/save-bulk', protect, teacher, saveBulkQuestions);

// Admin routes
router.post('/admin/create', protect, admin, createQuestion);
router.put('/admin/:questionId', protect, admin, updateQuestion);
router.delete('/admin/:questionId', protect, admin, deleteQuestion);

module.exports = router;
