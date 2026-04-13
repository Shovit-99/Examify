const Question = require('../models/Question');
const Exam = require('../models/Exam');
const StudentAnswer = require('../models/StudentAnswer');
const Grade = require('../models/Grade');

// Get all questions for an exam
exports.getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = await Question.find({ examId }).sort({ order: 1 });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single question (for preview)
exports.getSingleQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create question - Teachers only
exports.createQuestion = async (req, res) => {
  try {
    const { examId, questionText, options, marks, explanation, difficulty, order } = req.body;
    
    // Verify exam exists and belongs to teacher
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only add questions to your own exams' });
    }

    // Validate at least one option is marked as correct
    const hasCorrectOption = options.some(opt => opt.isCorrect);
    if (!hasCorrectOption) {
      return res.status(400).json({ message: 'At least one option must be marked as correct' });
    }

    const question = new Question({
      examId,
      createdBy: req.user.id,
      questionText,
      options,
      marks,
      explanation,
      difficulty,
      order: order || 1
    });

    await question.save();
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update question - Teachers only
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Verify permission
    const exam = await Exam.findById(question.examId);
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own questions' });
    }

    const { questionText, options, marks, explanation, difficulty, order } = req.body;

    if (options) {
      const hasCorrectOption = options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({ message: 'At least one option must be marked as correct' });
      }
      question.options = options;
    }

    if (questionText) question.questionText = questionText;
    if (marks) question.marks = marks;
    if (explanation) question.explanation = explanation;
    if (difficulty) question.difficulty = difficulty;
    if (order) question.order = order;

    await question.save();
    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete all questions for an exam - Teachers only
exports.deleteAllQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // Verify exam exists and belongs to teacher
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete questions from your own exams' });
    }

    const deletedCount = await Question.countDocuments({ examId });
    await Question.deleteMany({ examId });

    // Update exam's total questions count
    exam.totalQuestions = 0;
    await exam.save();

    res.status(200).json({ 
      message: `Successfully deleted ${deletedCount} questions`,
      deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete question - Teachers only
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Verify permission
    const exam = await Exam.findById(question.examId);
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own questions' });
    }

    await Question.findByIdAndDelete(req.params.questionId);
    
    // Reorder remaining questions
    await Question.updateMany(
      { examId: question.examId, order: { $gt: question.order } },
      { $inc: { order: -1 } }
    );

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit exam answers and get grades
exports.submitExamAnswers = async (req, res) => {
  try {
    const { examId, answers } = req.body; // answers = [{ questionId, selectedOption }, ...]
    const studentId = req.user.id;

    console.log('📝 Exam Submission Log:');
    console.log('  Student ID:', studentId);
    console.log('  Exam ID:', examId);
    console.log('  Answers Count:', answers?.length || 0);

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await Question.find({ examId });
    if (questions.length === 0) return res.status(400).json({ message: 'No questions in this exam' });

    let totalMarks = 0;
    let marksObtained = 0;
    const studentAnswers = [];

    // Calculate marks for each answer
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;

      totalMarks += question.marks;

      const selectedOption = question.options.find(opt => opt.optionText === answer.selectedOption);
      const isCorrect = selectedOption?.isCorrect || false;

      if (isCorrect) {
        marksObtained += question.marks;
      }

      studentAnswers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        marksObtained: isCorrect ? question.marks : 0
      });
    }

    // Calculate percentage
    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 85) grade = 'A';
    else if (percentage >= 80) grade = 'A-';
    else if (percentage >= 75) grade = 'B+';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 65) grade = 'B-';
    else if (percentage >= 60) grade = 'C+';
    else if (percentage >= 55) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    // Create or update grade record
    let gradeRecord = await Grade.findOne({ student: studentId, exam: examId });
    
    if (gradeRecord) {
      gradeRecord.marksObtained = marksObtained;
      gradeRecord.totalMarks = totalMarks;
      gradeRecord.percentage = percentage;
      gradeRecord.grade = grade;
      gradeRecord.submittedAt = new Date();
    } else {
      gradeRecord = new Grade({
        student: studentId,
        exam: examId,
        marksObtained,
        totalMarks,
        percentage,
        grade,
        subject: exam.subject,
        submittedAt: new Date()
      });
    }

    await gradeRecord.save();
    console.log('✅ Grade saved successfully:');
    console.log('  Grade ID:', gradeRecord._id);
    console.log('  Marks:', marksObtained, '/', totalMarks);
    console.log('  Percentage:', percentage, '%');
    console.log('  Grade:', grade);

    // Store student answers
    for (const answer of studentAnswers) {
      let studentAnswer = await StudentAnswer.findOne({
        gradeId: gradeRecord._id,
        questionId: answer.questionId,
        studentId
      });

      if (studentAnswer) {
        studentAnswer.selectedOption = answer.selectedOption;
        studentAnswer.isCorrect = answer.isCorrect;
        studentAnswer.marksObtained = answer.marksObtained;
      } else {
        studentAnswer = new StudentAnswer({
          gradeId: gradeRecord._id,
          questionId: answer.questionId,
          studentId,
          examId,
          selectedOption: answer.selectedOption,
          isCorrect: answer.isCorrect,
          marksObtained: answer.marksObtained
        });
      }
      await studentAnswer.save();
    }

    res.status(200).json({
      message: 'Exam submitted successfully',
      grade: gradeRecord,
      marksObtained,
      totalMarks,
      percentage,
      grade
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get exam questions count
exports.getQuestionCount = async (req, res) => {
  try {
    const { examId } = req.params;
    const count = await Question.countDocuments({ examId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload PDF and extract questions
exports.uploadPDFQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const { examId } = req.body;
    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    // Verify exam exists and belongs to teacher
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only add questions to your own exams' });
    }

    // Import PDF utilities
    const { extractTextFromPDF, parseQuestionsFromPDF } = require('../utils/pdfProcessor');

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(req.file.buffer);

    // Parse questions from text
    const extractedQuestions = parseQuestionsFromPDF(pdfText);

    if (extractedQuestions.length === 0) {
      return res.status(400).json({ 
        message: 'No questions could be extracted from the PDF. Please ensure the PDF follows a standard format with numbered questions and A/B/C/D options.' 
      });
    }

    // Return extracted questions for review
    res.status(200).json({
      message: `Successfully extracted ${extractedQuestions.length} questions`,
      questions: extractedQuestions,
      totalQuestions: extractedQuestions.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Save bulk questions from PDF extraction
exports.saveBulkQuestions = async (req, res) => {
  try {
    const { examId, questions } = req.body;

    if (!examId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Verify exam exists and belongs to teacher
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only add questions to your own exams' });
    }

    // Get current question count to set order
    // For PDF uploads, start fresh from order 1 (optionally clear existing)
    // Comment out the line below if you want to keep existing questions and append
    await Question.deleteMany({ examId });
    let order = 1;
    
    console.log(`🗑️  Cleared existing questions for exam ${examId}`);
    console.log(`📥 Starting to save ${questions.length} questions from PDF`);

    const savedQuestions = [];

    for (const questionData of questions) {
      // Validate question
      if (!questionData.questionText || !questionData.options || questionData.options.length < 2) {
        continue;
      }

      // Ensure at least one option is correct
      const hasCorrectOption = questionData.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption && questionData.options.length > 0) {
        questionData.options[0].isCorrect = true; // Default to first option
      }

      const question = new Question({
        examId,
        createdBy: req.user.id,
        questionText: questionData.questionText,
        options: questionData.options,
        marks: questionData.marks || 1,
        explanation: questionData.explanation || '',
        difficulty: questionData.difficulty || 'medium',
        order: order++
      });

      const saved = await question.save();
      savedQuestions.push(saved);
    }

    // Update exam's total questions count
    exam.totalQuestions = await Question.countDocuments({ examId });
    await exam.save();

    res.status(201).json({
      message: `Successfully saved ${savedQuestions.length} questions`,
      savedCount: savedQuestions.length,
      questions: savedQuestions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
