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
