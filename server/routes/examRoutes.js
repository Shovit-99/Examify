const express = require('express');
const router = express.Router();
const { protect, admin, teacher, adminOrTeacher } = require('../middleware/authMiddleware');
const { 
  getExams, 
  getSingleExam, 
  createExam, 
  updateExam, 
  deleteExam, 
  getSubjects,
  getTeacherExams,
  scheduleExam
} = require('../controllers/examController');

// Public access - students can see exams
router.get('/', getExams);
router.get('/subjects', getSubjects);
router.get('/single/:id', getSingleExam);

// Teacher routes
router.get('/teacher/my-exams', protect, teacher, getTeacherExams);
router.post('/teacher/create', protect, teacher, createExam);
router.put('/teacher/:id', protect, teacher, updateExam);
router.delete('/teacher/:id', protect, teacher, deleteExam);
router.put('/teacher/:id/schedule', protect, teacher, scheduleExam);

// Admin routes
router.post('/admin/create', protect, admin, createExam);
router.put('/admin/:id', protect, admin, updateExam);
router.delete('/admin/:id', protect, admin, deleteExam);

module.exports = router;