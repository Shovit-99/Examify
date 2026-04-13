const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllTeachers,
  assignInstructor,
  getValidInstructors,
  getTeachersWithoutInstructor
} = require('../controllers/adminController');

// Admin only routes for managing teachers and instructors
router.get('/teachers', protect, admin, getAllTeachers);
router.get('/teachers/unassigned', protect, admin, getTeachersWithoutInstructor);
router.put('/teachers/:teacherId/assign-instructor', protect, admin, assignInstructor);
router.get('/instructors', protect, admin, getValidInstructors);

module.exports = router;
