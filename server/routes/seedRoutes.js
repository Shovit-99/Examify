const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Grade = require('../models/Grade');

// THIS ROUTE DOES NOT REQUIRE AUTHENTICATION - For easy testing
// Seed exams - NO AUTH REQUIRED - Accepts both GET and POST
router.get('/seed-exams', async (req, res) => {
  try {
    // Delete existing exams first
    await Exam.deleteMany({});
    
    // Using a placeholder admin ID (no body in GET request)
    const adminId = '507f1f77bcf86cd799439011';

    const examsData = [
      {
        subject: 'Software Engineering',
        instructor: 'Dr. Deekshant Semwal',
        courseCode: 'SE-301',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 50,
        description: 'Comprehensive exam on software engineering principles and practices',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Theory of Computation',
        instructor: 'Dr. Jigyasa Arora',
        courseCode: 'TOC-401',
        date: null,
        timeLimit: null,
        totalMarks: 80,
        totalQuestions: 40,
        description: 'Test on automata, formal languages, and computability',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Advance Frontend',
        instructor: 'Dr. Sunil Ghlidiyal',
        courseCode: 'AF-201',
        date: null,
        timeLimit: null,
        totalMarks: 90,
        totalQuestions: 35,
        description: 'Advanced React, TypeScript, and modern frontend frameworks',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Container Technologies',
        instructor: 'Dr. Garima Verma',
        courseCode: 'CT-205',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 45,
        description: 'Docker, Kubernetes, and containerization best practices',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Hydrogen Energy',
        instructor: 'Dr. Abhishek',
        courseCode: 'HE-102',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 50,
        description: 'Hydrogen production, storage, and applications in renewable energy',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Technical Training',
        instructor: 'Mr. Amit Srivastava',
        courseCode: 'TT-150',
        date: null,
        timeLimit: null,
        totalMarks: 50,
        totalQuestions: 25,
        description: 'Professional skills and technical competencies assessment',
        status: 'scheduled',
        createdBy: adminId
      }
    ];

    const createdExams = await Exam.insertMany(examsData);
    res.status(201).json({ 
      message: '✅ Exams seeded successfully! (Dates/Times not set - Teacher/Admin must update them)',
      count: createdExams.length,
      exams: createdExams.map(e => ({ subject: e.subject, instructor: e.instructor, courseCode: e.courseCode, dateSet: !!e.date }))
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/seed-exams', async (req, res) => {
  try {
    // Delete existing exams first
    await Exam.deleteMany({});
    
    // Using a placeholder admin ID
    const adminId = req.body.adminId || '507f1f77bcf86cd799439011';

    const examsData = [
      {
        subject: 'Software Engineering',
        instructor: 'Dr. Deekshant Semwal',
        courseCode: 'SE-301',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 50,
        description: 'Comprehensive exam on software engineering principles and practices',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Theory of Computation',
        instructor: 'Dr. Jigyasa Arora',
        courseCode: 'TOC-401',
        date: null,
        timeLimit: null,
        totalMarks: 80,
        totalQuestions: 40,
        description: 'Test on automata, formal languages, and computability',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Advance Frontend',
        instructor: 'Dr. Sunil Ghlidiyal',
        courseCode: 'AF-201',
        date: null,
        timeLimit: null,
        totalMarks: 90,
        totalQuestions: 35,
        description: 'Advanced React, TypeScript, and modern frontend frameworks',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Container Technologies',
        instructor: 'Dr. Garima Verma',
        courseCode: 'CT-205',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 45,
        description: 'Docker, Kubernetes, and containerization best practices',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Hydrogen Energy',
        instructor: 'Dr. Abhishek',
        courseCode: 'HE-102',
        date: null,
        timeLimit: null,
        totalMarks: 100,
        totalQuestions: 50,
        description: 'Hydrogen production, storage, and applications in renewable energy',
        status: 'scheduled',
        createdBy: adminId
      },
      {
        subject: 'Technical Training',
        instructor: 'Mr. Amit Srivastava',
        courseCode: 'TT-150',
        date: null,
        timeLimit: null,
        totalMarks: 50,
        totalQuestions: 25,
        description: 'Professional skills and technical competencies assessment',
        status: 'scheduled',
        createdBy: adminId
      }
    ];

    const createdExams = await Exam.insertMany(examsData);
    res.status(201).json({ 
      message: '✅ Exams seeded successfully! (Dates/Times not set - Teacher/Admin must update them)',
      count: createdExams.length,
      exams: createdExams.map(e => ({ subject: e.subject, instructor: e.instructor, courseCode: e.courseCode, dateSet: !!e.date }))
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed grades - NO AUTH REQUIRED - Accepts GET and POST
router.get('/seed-grades/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ message: 'studentId is required in URL' });

    // Delete existing grades
    await Grade.deleteMany({ student: studentId });

    const exams = await Exam.find().limit(6);
    if (exams.length === 0) return res.status(400).json({ message: 'No exams found. Run seed-exams first!' });

    const gradesData = exams.map(exam => {
      const marksObtained = Math.floor(Math.random() * (exam.totalMarks - 40)) + 40;
      const percentage = (marksObtained / exam.totalMarks) * 100;
      
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'A-';
      else if (percentage >= 60) grade = 'B+';
      else if (percentage >= 50) grade = 'B';
      else if (percentage >= 40) grade = 'B-';
      else grade = 'C+';

      return {
        student: studentId,
        exam: exam._id,
        subject: exam.subject,
        marksObtained,
        totalMarks: exam.totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        attemptDate: exam.date,
        feedback: 'Good attempt! Keep learning and practicing.'
      };
    });

    const createdGrades = await Grade.insertMany(gradesData);
    res.status(201).json({ 
      message: '✅ Grades seeded successfully!', 
      count: createdGrades.length,
      grades: createdGrades.map(g => ({ subject: g.subject, marks: `${g.marksObtained}/${g.totalMarks}`, grade: g.grade }))
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/seed-grades', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required in request body' });

    // Delete existing grades
    await Grade.deleteMany({ student: studentId });

    const exams = await Exam.find().limit(6);
    if (exams.length === 0) return res.status(400).json({ message: 'No exams found. Run seed-exams first!' });

    const gradesData = exams.map(exam => {
      const marksObtained = Math.floor(Math.random() * (exam.totalMarks - 40)) + 40;
      const percentage = (marksObtained / exam.totalMarks) * 100;
      
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'A-';
      else if (percentage >= 60) grade = 'B+';
      else if (percentage >= 50) grade = 'B';
      else if (percentage >= 40) grade = 'B-';
      else grade = 'C+';

      return {
        student: studentId,
        exam: exam._id,
        subject: exam.subject,
        marksObtained,
        totalMarks: exam.totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        attemptDate: exam.date,
        feedback: 'Good attempt! Keep learning and practicing.'
      };
    });

    const createdGrades = await Grade.insertMany(gradesData);
    res.status(201).json({ 
      message: '✅ Grades seeded successfully!', 
      count: createdGrades.length,
      grades: createdGrades.map(g => ({ subject: g.subject, marks: `${g.marksObtained}/${g.totalMarks}`, grade: g.grade }))
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
