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
  scheduleExam,
  getExamsForMonitoring,
  getExamMonitoringDetails,
  pauseExam,
  resumeExam,
  endExamEarly,
  registerStudentAttempt,
  updateStudentSubmission
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

// Admin monitoring and control routes
router.get('/admin/monitoring/all', protect, admin, getExamsForMonitoring);
router.get('/admin/monitoring/:id', protect, admin, getExamMonitoringDetails);
router.put('/admin/control/:id/pause', protect, admin, pauseExam);
router.put('/admin/control/:id/resume', protect, admin, resumeExam);
router.put('/admin/control/:id/end', protect, admin, endExamEarly);

// Student attempt tracking routes
router.post('/student/register-attempt', protect, registerStudentAttempt);
router.post('/student/submit', protect, updateStudentSubmission);

module.exports = router;