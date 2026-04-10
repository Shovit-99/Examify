const Exam = require('../models/Exam');
const User = require('../models/User');

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

    const exams = await Exam.find(query).populate('createdBy', 'name email').sort({ date: 1 });
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

    const exam = new Exam({
      subject,
      instructor: instructor || teacher.name,
      courseCode,
      date,
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
    if (instructor) exam.instructor = instructor;
    if (courseCode) exam.courseCode = courseCode;
    if (date) exam.date = date;
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
    
    if (date) exam.date = date;
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
