const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import your controller functions (we will build these next)
const { getExams, createExam, deleteExam } = require('../controllers/examController');

// 1. PUBLIC ROUTE: No middleware. Anyone can see the list of exams.
// router.get('/', getExams);

// 2. PROTECTED ROUTE: Only logged-in users (Students, Teachers, Admins)
// router.get('/:id', protect, getSingleExam);

// 3. ADMIN/TEACHER ONLY ROUTE: Requires both 'protect' AND 'admin'
// If a student hits this, the 'admin' bouncer will kick them out!
router.post('/create', protect, admin, createExam);
router.delete('/:id', protect, admin, deleteExam);

module.exports = router;