const express = require('express');
const router = express.Router();
const { protect, admin, teacher } = require('../middleware/authMiddleware');
const { 
  getStudentGrades, 
  getExamGrades, 
  addGrade, 
  deleteGrade,
  getStudentAnalytics,
  getTeacherExamResults,
  getGradeDistribution
} = require('../controllers/gradeController');

// Student routes - These will validate student by checking URL params or filtering by user
router.get('/my-grades/:studentId', getStudentGrades);
router.get('/analytics/:studentId', getStudentAnalytics);

// Teacher routes
router.get('/exam/:examId/results', protect, teacher, getTeacherExamResults);
router.get('/exam/:examId/distribution', protect, teacher, getGradeDistribution);

// Admin routes
router.get('/exam/:examId', protect, admin, getExamGrades);
router.post('/add', protect, admin, addGrade);
router.delete('/:id', protect, admin, deleteGrade);

module.exports = router;
