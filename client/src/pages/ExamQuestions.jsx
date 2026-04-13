import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Copy, Loader, AlertCircle, Upload, FileText } from 'lucide-react';
import axios from 'axios';

const ExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [showExtractedModal, setShowExtractedModal] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    marks: 1,
    explanation: '',
    difficulty: 'medium'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId]);

  const fetchExamAndQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('examifyToken');
      
      const examRes = await axios.get(`http://localhost:5000/api/exams/single/${examId}`);
      setExam(examRes.data);

      const questionsRes = await axios.get(`http://localhost:5000/api/questions/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        options: question.options,
        marks: question.marks,
        explanation: question.explanation,
        difficulty: question.difficulty
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: '',
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ],
        marks: 1,
        explanation: '',
        difficulty: 'medium'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ],
      marks: 1,
      explanation: '',
      difficulty: 'medium'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marks' ? parseInt(value) : value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'isCorrect') {
      // Uncheck other options if this one is correct
      if (value) {
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        newOptions[index].isCorrect = false;
      }
    } else {
      newOptions[index].optionText = value;
    }
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.questionText.trim()) {
      alert('Please enter the question text');
      return;
    }

    if (!formData.options.some(opt => opt.optionText.trim())) {
      alert('Please fill at least one option');
      return;
    }

    if (!formData.options.some(opt => opt.isCorrect)) {
      alert('Please mark at least one option as correct');
      return;
    }

    try {
      const token = localStorage.getItem('examifyToken');
      const payload = {
        examId,
        questionText: formData.questionText,
        options: formData.options,
        marks: formData.marks,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        order: editingQuestion ? editingQuestion.order : questions.length + 1
      };

      if (editingQuestion) {
        await axios.put(
          `http://localhost:5000/api/questions/${editingQuestion._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Question updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/questions/create',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Question created successfully');
      }

      fetchExamAndQuestions();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error saving question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = localStorage.getItem('examifyToken');
      await axios.delete(
        `http://localhost:5000/api/questions/${questionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Question deleted successfully');
      fetchExamAndQuestions();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error deleting question');
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPDF(true);
      const token = localStorage.getItem('examifyToken');
      const formDataObj = new FormData();
      formDataObj.append('pdf', file);
      formDataObj.append('examId', examId);

      const response = await axios.post(
        'http://localhost:5000/api/questions/upload-pdf',
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setExtractedQuestions(response.data.questions);
      setShowExtractedModal(true);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert(error.response?.data?.message || 'Error processing PDF. Please ensure it follows standard format with numbered questions and A/B/C/D options.');
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleSaveBulkQuestions = async () => {
    if (extractedQuestions.length === 0) return;

    try {
      const token = localStorage.getItem('examifyToken');
      await axios.post(
        'http://localhost:5000/api/questions/save-bulk',
        { examId, questions: extractedQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Successfully imported ${extractedQuestions.length} questions!`);
      fetchExamAndQuestions();
      setExtractedQuestions([]);
      setShowExtractedModal(false);
    } catch (error) {
      console.error('Error saving questions:', error);
      alert(error.response?.data?.message || 'Error saving questions');
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!window.confirm('Are you sure you want to delete ALL questions for this exam? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('examifyToken');
      await axios.delete(
        `http://localhost:5000/api/questions/exam/${examId}/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('All questions deleted successfully!');
      fetchExamAndQuestions();
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert(error.response?.data?.message || 'Error deleting questions');
    }
  };

  const handleExtractedQuestionChange = (index, field, value) => {
    const newQuestions = [...extractedQuestions];
    if (field === 'questionText' || field === 'marks' || field === 'difficulty') {
      newQuestions[index][field] = field === 'marks' ? parseInt(value) : value;
    } else if (field.startsWith('option')) {
      const parts = field.split('_');
      const optionIndex = parseInt(parts[1]);
      const optionField = parts[2];
      
      if (optionField === 'text') {
        newQuestions[index].options[optionIndex].optionText = value;
      } else if (optionField === 'correct') {
        newQuestions[index].options.forEach((opt, i) => {
          opt.isCorrect = i === optionIndex;
        });
      }
    }
    setExtractedQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-50 to-blue-50">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="flex items-center gap-2 text-purple-600 font-bold hover:text-purple-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-800">{exam?.subject}</h1>
            <p className="text-gray-500">{exam?.courseCode} • {questions.length} Questions</p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* PDF Upload Input - Hidden */}
          <input
            type="file"
            id="pdfInput"
            accept=".pdf"
            onChange={handlePDFUpload}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('pdfInput').click()}
            disabled={uploadingPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploadingPDF ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload PDF
              </>
            )}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
          <button
            onClick={handleDeleteAllQuestions}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition"
          >
            <Trash2 className="w-5 h-5" />
            Delete All
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question, idx) => (
            <div key={question._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Q{idx + 1}: {question.questionText}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                      {question.marks} marks
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(question)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-4">
                {question.options.map((option, optIdx) => (
                  <div key={optIdx} className={`p-3 rounded-lg flex items-center gap-3 ${
                    option.isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.optionText}</span>
                    {option.isCorrect && (
                      <span className="ml-auto text-xs font-bold text-green-700">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-600">{question.explanation}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-md border border-gray-200 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-4">No questions added yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Add Your First Question
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Question *</label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  placeholder="Enter your question here..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Marks and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Marks *</label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Options *</label>
                <div className="space-y-3">
                  {formData.options.map((option, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => handleOptionChange(idx, 'optionText', e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      {option.isCorrect && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Explanation (Optional)</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Explain why this answer is correct..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extracted Questions Modal */}
      {showExtractedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Review Extracted Questions</h2>
                <p className="text-gray-500 text-sm mt-1">{extractedQuestions.length} questions found in PDF</p>
              </div>
              <button
                onClick={() => {
                  setShowExtractedModal(false);
                  setExtractedQuestions([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {extractedQuestions.map((question, qIdx) => (
                <div key={qIdx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Q{qIdx + 1}: {question.questionText.length > 40 ? question.questionText.substring(0, 40) + '...' : question.questionText}</label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleExtractedQuestionChange(qIdx, 'questionText', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Marks</label>
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => handleExtractedQuestionChange(qIdx, 'marks', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Difficulty</label>
                      <select
                        value={question.difficulty}
                        onChange={(e) => handleExtractedQuestionChange(qIdx, 'difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">Options</label>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            checked={option.isCorrect}
                            onChange={() => handleExtractedQuestionChange(qIdx, `option_${oIdx}_correct`, true)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={option.optionText}
                            onChange={(e) => handleExtractedQuestionChange(qIdx, `option_${oIdx}_text`, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          />
                          {option.isCorrect && <span className="text-green-600 font-bold text-sm">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setShowExtractedModal(false);
                  setExtractedQuestions([]);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulkQuestions}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Save {extractedQuestions.length} Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamQuestions;
