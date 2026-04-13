const Exam = require('../models/Exam');
const User = require('../models/User');
const Grade = require('../models/Grade');

// Get all exams or search exams
exports.getExams = async (req, res) => {
  try {
    const { search, subject, instructor } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) {
      query.subject = subject;
    }

    if (instructor) {
      query.instructor = instructor;
    }

    const exams = await Exam.find(query).populate('createdBy', 'name email').sort({ date: 1, createdAt: -1 });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single exam
exports.getSingleExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's exams only
exports.getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const exams = await Exam.find({ createdBy: teacherId }).populate('createdBy', 'name email subject');
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exam - Teachers can only create for their subject
exports.createExam = async (req, res) => {
  try {
    const { subject, instructor, courseCode, date, timeLimit, totalMarks, totalQuestions, description } = req.body;
    const teacher = await User.findById(req.user.id);

    // Teacher can only create exams for their assigned subject
    if (req.user.role === 'teacher' && teacher.subject !== subject) {
      return res.status(403).json({ 
        message: `You can only create exams for your subject: ${teacher.subject}` 
      });
    }

    // Use provided instructor, fall back to teacher's instructor, or leave as null
    const examInstructor = instructor || teacher.instructor || null;

    const exam = new Exam({
      subject,
      instructor: examInstructor,
      courseCode,
      date: date ? new Date(date) : null,
      timeLimit,
      totalMarks,
      totalQuestions,
      description,
      createdBy: req.user.id,
      status: 'scheduled'
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update exam - Teachers can only update their own exams
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Check if user has permission to update
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own exams' });
    }

    const teacher = await User.findById(req.user.id);
    const { subject, instructor, courseCode, date, timeLimit, totalMarks, totalQuestions, description, status } = req.body;
    
    // Teacher can only update exams for their subject
    if (req.user.role === 'teacher' && subject && teacher.subject !== subject) {
      return res.status(403).json({ 
        message: `You can only manage exams for your subject: ${teacher.subject}` 
      });
    }

    if (subject) exam.subject = subject;
    
    // Handle instructor - teachers can't change it, admins can
    if (instructor) {
      if (req.user.role === 'admin') {
        exam.instructor = instructor;
      }
      // Teachers: keep original instructor, don't allow changes
    }
    
    if (courseCode) exam.courseCode = courseCode;
    if (date !== undefined) exam.date = date ? new Date(date) : null;
    if (timeLimit) exam.timeLimit = timeLimit;
    if (totalMarks) exam.totalMarks = totalMarks;
    if (totalQuestions) exam.totalQuestions = totalQuestions;
    if (description) exam.description = description;
    if (status) {
      exam.status = status;
      if (status !== 'scheduled') {
        exam.dateUpdatedBy = req.user.id;
        exam.dateUpdatedAt = new Date();
      }
    }

    await exam.save();
    res.status(200).json({ message: 'Exam updated successfully', exam });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete exam - Teachers can only delete their own exams
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Check if user has permission to delete
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own exams' });
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = [
      'Software Engineering',
      'Theory of Computation',
      'Advance Frontend',
      'Container Technologies',
      'Hydrogen Energy',
      'Technical Training'
    ];
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exam schedule (date and status)
exports.scheduleExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Check if user has permission
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only schedule your own exams' });
    }

    const { date, status, timeLimit } = req.body;
    
    if (date !== undefined) exam.date = date ? new Date(date) : null;
    if (status) exam.status = status;
    if (timeLimit) exam.timeLimit = timeLimit;
    
    exam.dateUpdatedBy = req.user.id;
    exam.dateUpdatedAt = new Date();

    await exam.save();
    res.status(200).json({ message: 'Exam scheduled successfully', exam });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========== ADMIN EXAM MONITORING & CONTROL ==========

// Get all exams with monitoring data (for admin dashboard)
exports.getExamsForMonitoring = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('createdBy', 'name email')
      .populate('pausedBy', 'name email')
      .sort({ date: -1 });
    
    const monitoringData = exams.map(exam => ({
      id: exam._id,
      subject: exam.subject,
      courseCode: exam.courseCode,
      instructor: exam.instructor,
      status: exam.status,
      isPaused: exam.isPaused,
      date: exam.date,
      timeLimit: exam.timeLimit,
      totalMarks: exam.totalMarks,
      totalAttempts: exam.totalAttempts,
      submissionsReceived: exam.submissionsReceived,
      activeStudentsCount: exam.activeStudents ? exam.activeStudents.length : 0,
      completionRate: exam.totalAttempts > 0 
        ? ((exam.submissionsReceived / exam.totalAttempts) * 100).toFixed(2) 
        : 0,
      pausedAt: exam.pausedAt,
      pausedBy: exam.pausedBy,
      createdBy: exam.createdBy,
      createdAt: exam.createdAt
    }));

    res.status(200).json(monitoringData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed monitoring data for a specific exam
exports.getExamMonitoringDetails = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('activeStudents.studentId', 'name email')
      .populate('pausedBy', 'name email');
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const grades = await Grade.find({ exam: req.params.id })
      .populate('student', 'name email');

    const detailedData = {
      exam: {
        id: exam._id,
        subject: exam.subject,
        courseCode: exam.courseCode,
        instructor: exam.instructor,
        status: exam.status,
        isPaused: exam.isPaused,
        date: exam.date,
        timeLimit: exam.timeLimit,
        totalMarks: exam.totalMarks,
        createdBy: exam.createdBy,
        pausedAt: exam.pausedAt,
        pausedBy: exam.pausedBy
      },
      statistics: {
        totalAttempts: exam.totalAttempts,
        submissionsReceived: exam.submissionsReceived,
        pendingSubmissions: Math.max(0, exam.totalAttempts - exam.submissionsReceived),
        completionRate: exam.totalAttempts > 0 
          ? ((exam.submissionsReceived / exam.totalAttempts) * 100).toFixed(2) 
          : 0,
        activeStudentsCount: exam.activeStudents ? exam.activeStudents.length : 0
      },
      activeStudents: exam.activeStudents || [],
      submissions: grades.map(g => ({
        studentId: g.student._id,
        studentName: g.student.name,
        studentEmail: g.student.email,
        marksObtained: g.marksObtained,
        totalMarks: g.totalMarks,
        percentage: g.percentage,
        grade: g.grade,
        submittedAt: g.submittedAt
      }))
    };

    res.status(200).json(detailedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pause an ongoing exam
exports.pauseExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (exam.status !== 'ongoing') {
      return res.status(400).json({ message: 'Can only pause ongoing exams' });
    }

    if (exam.isPaused) {
      return res.status(400).json({ message: 'Exam is already paused' });
    }

    exam.isPaused = true;
    exam.pausedAt = new Date();
    exam.pausedBy = req.user.id;
    exam.status = 'paused';
    await exam.save();

    res.status(200).json({ 
      message: 'Exam paused successfully', 
      exam: {
        id: exam._id,
        status: exam.status,
        isPaused: exam.isPaused,
        pausedAt: exam.pausedAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Resume a paused exam
exports.resumeExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (!exam.isPaused) {
      return res.status(400).json({ message: 'Exam is not paused' });
    }

    exam.isPaused = false;
    exam.pausedAt = null;
    exam.pausedBy = null;
    exam.status = 'ongoing';
    await exam.save();

    res.status(200).json({ 
      message: 'Exam resumed successfully', 
      exam: {
        id: exam._id,
        status: exam.status,
        isPaused: exam.isPaused
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// End exam early (Force completion)
exports.endExamEarly = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (exam.status === 'completed') {
      return res.status(400).json({ message: 'Exam is already completed' });
    }

    exam.status = 'completed';
    exam.isPaused = false;
    exam.pausedAt = null;
    exam.dateUpdatedBy = req.user.id;
    exam.dateUpdatedAt = new Date();
    await exam.save();

    res.status(200).json({ 
      message: 'Exam ended successfully', 
      exam: {
        id: exam._id,
        status: exam.status,
        completedAt: exam.dateUpdatedAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Register student as taking exam (called when student starts exam)
exports.registerStudentAttempt = async (req, res) => {
  try {
    const { examId, studentId, studentName, studentEmail } = req.body;
    
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Add to active students
    const studentIndex = exam.activeStudents.findIndex(
      s => s.studentId.toString() === studentId
    );

    if (studentIndex === -1) {
      exam.activeStudents.push({
        studentId,
        name: studentName,
        email: studentEmail,
        startedAt: new Date(),
        lastActivityAt: new Date()
      });
      exam.totalAttempts += 1;
    }

    await exam.save();

    res.status(200).json({ 
      message: 'Student attempt registered', 
      exam: { id: exam._id, totalAttempts: exam.totalAttempts }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update student submission
exports.updateStudentSubmission = async (req, res) => {
  try {
    const { examId, studentId } = req.body;
    
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Remove from active students
    exam.activeStudents = exam.activeStudents.filter(
      s => s.studentId.toString() !== studentId
    );

    exam.submissionsReceived += 1;
    await exam.save();

    res.status(200).json({ 
      message: 'Submission recorded', 
      exam: { 
        id: exam._id, 
        submissionsReceived: exam.submissionsReceived 
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
