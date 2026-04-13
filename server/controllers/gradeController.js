const Grade = require('../models/Grade');
const Exam = require('../models/Exam');

// Get all grades for a student
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });
    
    const grades = await Grade.find({ student: studentId })
      .populate('exam', 'subject courseCode date instructor')
      .sort({ submittedAt: -1 });
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all grades for an exam
exports.getExamGrades = async (req, res) => {
  try {
    const { examId } = req.params;
    const grades = await Grade.find({ exam: examId })
      .populate('student', 'name email')
      .sort({ marksObtained: -1 });
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update grade for a student
exports.addGrade = async (req, res) => {
  try {
    const { studentId, examId, marksObtained, totalMarks, feedback } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const percentage = (marksObtained / totalMarks) * 100;
    
    let grade;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'A-';
    else if (percentage >= 60) grade = 'B+';
    else if (percentage >= 50) grade = 'B';
    else if (percentage >= 40) grade = 'B-';
    else if (percentage >= 30) grade = 'C+';
    else if (percentage >= 20) grade = 'C';
    else if (percentage >= 10) grade = 'D';
    else grade = 'F';

    let studentGrade = await Grade.findOne({ student: studentId, exam: examId });

    if (studentGrade) {
      studentGrade.marksObtained = marksObtained;
      studentGrade.totalMarks = totalMarks;
      studentGrade.percentage = percentage;
      studentGrade.grade = grade;
      if (feedback) studentGrade.feedback = feedback;
      await studentGrade.save();
    } else {
      studentGrade = new Grade({
        student: studentId,
        exam: examId,
        subject: exam.subject,
        marksObtained,
        totalMarks,
        percentage,
        grade,
        attemptDate: new Date(),
        feedback
      });
      await studentGrade.save();
    }

    res.status(201).json({ message: 'Grade added successfully', studentGrade });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get student grade analytics
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });
    
    const grades = await Grade.find({ student: studentId });

    if (grades.length === 0) {
      return res.status(200).json({
        totalExams: 0,
        averagePercentage: 0,
        totalMarksObtained: 0,
        totalMarks: 0,
        grades: []
      });
    }

    const totalMarksObtained = grades.reduce((sum, g) => sum + g.marksObtained, 0);
    const totalMarks = grades.reduce((sum, g) => sum + g.totalMarks, 0);
    const averagePercentage = (totalMarksObtained / totalMarks) * 100;

    res.status(200).json({
      totalExams: grades.length,
      averagePercentage: averagePercentage.toFixed(2),
      totalMarksObtained,
      totalMarks,
      grades
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a grade
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all exam results for a teacher (for their exams)
exports.getTeacherExamResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { examId } = req.params;

    console.log('📊 Teacher Results Request:');
    console.log('  Teacher ID:', teacherId);
    console.log('  Exam ID:', examId);

    // Verify exam belongs to teacher
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log('❌ Exam not found');
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    console.log('  Exam Found:', exam.subject);
    console.log('  Exam CreatedBy:', exam.createdBy.toString());
    
    if (exam.createdBy.toString() !== teacherId) {
      console.log('❌ Permission denied - exam not created by this teacher');
      return res.status(403).json({ message: 'You can only view results for your own exams' });
    }

    const results = await Grade.find({ exam: examId })
      .populate('student', 'name email roll')
      .sort({ marksObtained: -1 });

    console.log('✅ Results found:', results.length);

    // Calculate statistics
    const stats = {
      totalAttempts: results.length,
      highestScore: results.length > 0 ? results[0].marksObtained : 0,
      lowestScore: results.length > 0 ? results[results.length - 1].marksObtained : 0,
      averageScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.marksObtained, 0) / results.length).toFixed(2) : 0,
      averagePercentage: results.length > 0 ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2) : 0,
      passCount: results.filter(r => r.percentage >= 40).length,
      failCount: results.filter(r => r.percentage < 40).length
    };

    res.status(200).json({
      exam: {
        subject: exam.subject,
        courseCode: exam.courseCode,
        totalQuestions: exam.totalQuestions
      },
      stats,
      results
    });
  } catch (error) {
    console.error('❌ Error retrieving results:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get grade distribution for an exam (for charts)
exports.getGradeDistribution = async (req, res) => {
  try {
    const { examId } = req.params;

    const grades = await Grade.find({ exam: examId });

    const distribution = {
      'A+': grades.filter(g => g.percentage >= 90).length,
      'A': grades.filter(g => g.percentage >= 85 && g.percentage < 90).length,
      'A-': grades.filter(g => g.percentage >= 80 && g.percentage < 85).length,
      'B+': grades.filter(g => g.percentage >= 75 && g.percentage < 80).length,
      'B': grades.filter(g => g.percentage >= 70 && g.percentage < 75).length,
      'B-': grades.filter(g => g.percentage >= 65 && g.percentage < 70).length,
      'C+': grades.filter(g => g.percentage >= 60 && g.percentage < 65).length,
      'C': grades.filter(g => g.percentage >= 55 && g.percentage < 60).length,
      'D': grades.filter(g => g.percentage >= 50 && g.percentage < 55).length,
      'F': grades.filter(g => g.percentage < 50).length
    };

    res.status(200).json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
