const Exam = require('../models/Exam');

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

// Create exam
exports.createExam = async (req, res) => {
  try {
    const { subject, instructor, courseCode, date, timeLimit, totalMarks, totalQuestions, description } = req.body;

    const exam = new Exam({
      subject,
      instructor,
      courseCode,
      date,
      timeLimit,
      totalMarks,
      totalQuestions,
      description,
      createdBy: req.user.id
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const { subject, instructor, courseCode, date, timeLimit, totalMarks, description, status } = req.body;
    
    if (subject) exam.subject = subject;
    if (instructor) exam.instructor = instructor;
    if (courseCode) exam.courseCode = courseCode;
    if (date) exam.date = date;
    if (timeLimit) exam.timeLimit = timeLimit;
    if (totalMarks) exam.totalMarks = totalMarks;
    if (description) exam.description = description;
    if (status) exam.status = status;

    await exam.save();
    res.status(200).json({ message: 'Exam updated successfully', exam });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
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
