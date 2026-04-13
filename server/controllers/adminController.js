const User = require('../models/User');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('name email subject instructor createdAt');
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign instructor to a teacher
exports.assignInstructor = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { instructor } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    const validInstructors = [
      'Dr. Deekshant Semwal',
      'Dr. Jigyasa Arora',
      'Dr. Sunil Ghlidiyal',
      'Dr. Garima Verma',
      'Dr. Abhishek',
      'Mr. Amit Srivastava'
    ];

    if (!validInstructors.includes(instructor)) {
      return res.status(400).json({ 
        message: 'Invalid instructor. Valid options: ' + validInstructors.join(', ')
      });
    }

    teacher.instructor = instructor;
    await teacher.save();

    res.status(200).json({ 
      message: 'Instructor assigned successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        instructor: teacher.instructor
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all valid instructors
exports.getValidInstructors = async (req, res) => {
  try {
    const instructors = [
      'Dr. Deekshant Semwal',
      'Dr. Jigyasa Arora',
      'Dr. Sunil Ghlidiyal',
      'Dr. Garima Verma',
      'Dr. Abhishek',
      'Mr. Amit Srivastava'
    ];
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teachers without instructor assigned
exports.getTeachersWithoutInstructor = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      instructor: { $in: [null, undefined, ''] }
    }).select('name email subject createdAt');

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
