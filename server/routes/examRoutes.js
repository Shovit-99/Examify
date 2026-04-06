const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getExams, getSingleExam, createExam, updateExam, deleteExam, getSubjects } = require('../controllers/examController');

// Public access - students need to see exams
router.get('/', getExams);
router.get('/subjects', getSubjects);
router.get('/:id', getSingleExam);

// Admin only
router.post('/create', protect, admin, createExam);
router.put('/:id', protect, admin, updateExam);
router.delete('/:id', protect, admin, deleteExam);

module.exports = router;