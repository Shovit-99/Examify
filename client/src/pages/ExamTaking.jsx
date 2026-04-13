import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (!timeLeft || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const fetchExamAndQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('examifyToken');
      
      const examRes = await axios.get(`http://localhost:5000/api/exams/single/${examId}`);
      setExam(examRes.data);

      // Set timer
      if (examRes.data.timeLimit) {
        setTimeLeft(examRes.data.timeLimit * 60);
      }

      const questionsRes = await axios.get(
        `http://localhost:5000/api/questions/exam/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(questionsRes.data.sort((a, b) => a.order - b.order));

      // Initialize answers object
      const answersObj = {};
      questionsRes.data.forEach(q => {
        answersObj[q._id] = '';
      });
      setAnswers(answersObj);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  const handleSubmitExam = async () => {
    if (submitted) return;

    try {
      const token = localStorage.getItem('examifyToken');
      
      // Convert answers to format expected by backend
      const answerArray = questions.map(q => ({
        questionId: q._id,
        selectedOption: answers[q._id]
      }));

      const response = await axios.post(
        'http://localhost:5000/api/questions/submit',
        { examId, answers: answerArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert(error.response?.data?.message || 'Error submitting exam');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-emerald-100 text-emerald-700',
      'A': 'bg-emerald-100 text-emerald-700',
      'A-': 'bg-emerald-100 text-emerald-700',
      'B+': 'bg-blue-100 text-blue-700',
      'B': 'bg-blue-100 text-blue-700',
      'B-': 'bg-yellow-100 text-yellow-700',
      'C+': 'bg-orange-100 text-orange-700',
      'C': 'bg-orange-100 text-orange-700',
      'D': 'bg-red-100 text-red-700',
      'F': 'bg-red-100 text-red-700'
    };
    return colors[grade] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-bold mb-6">Exam not available</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center">
              <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Exam Submitted!</h1>
              <p className="text-emerald-100">Your results have been calculated</p>
            </div>

            {/* Score Details */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 text-center border border-primary-200">
                  <p className="text-gray-600 font-semibold text-sm mb-2">Marks Obtained</p>
                  <p className="text-3xl font-bold text-primary-700">{result.marksObtained}/{result.totalMarks}</p>
                </div>
                <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 text-center border border-accent-200">
                  <p className="text-gray-600 font-semibold text-sm mb-2">Percentage</p>
                  <p className="text-3xl font-bold text-accent-700">{result.percentage}%</p>
                </div>
              </div>

              {/* Grade Display */}
              <div className={`rounded-xl p-8 mb-8 text-center ${getGradeColor(result.grade)}`}>
                <p className="text-sm font-semibold opacity-75 mb-2">Your Grade</p>
                <p className="text-6xl font-bold">{result.grade}</p>
              </div>

              {/* Performance Message */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 text-center border border-blue-200">
                <p className="text-gray-700 font-medium">
                  {result.percentage >= 90
                    ? '🎉 Excellent performance! Keep up the great work!'
                    : result.percentage >= 75
                    ? '👏 Good job! You have a solid understanding.'
                    : result.percentage >= 50
                    ? '📚 You passed! Review the material for next time.'
                    : '💪 Keep practicing! You\'ll do better next time.'}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/student')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/exam/${examId}`)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(ans => ans !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.subject}</h1>
            <p className="text-sm text-gray-500">{exam.courseCode}</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold font-mono ${timeLeft && timeLeft < 300 ? 'text-red-600' : 'text-primary-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Time Remaining</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">Question <span className="text-primary-600 font-bold">{currentQuestionIndex + 1}</span>/{questions.length}</p>
            <p className="text-xs text-gray-500 mt-1">Answered: {answeredCount}/{questions.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            {/* Question Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex-1">
                  {currentQuestion.questionText}
                </h2>
                <span className="text-sm bg-primary-100 text-primary-700 px-4 py-1.5 rounded-lg font-bold whitespace-nowrap">
                  {currentQuestion.marks} mk{currentQuestion.marks > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    answers[currentQuestion._id] === option.optionText
                      ? 'bg-primary-50 border-primary-500 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={option.optionText}
                    checked={answers[currentQuestion._id] === option.optionText}
                    onChange={(e) => handleSelectAnswer(currentQuestion._id, e.target.value)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="ml-4 text-gray-800 font-medium">{option.optionText}</span>
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-8 border-t border-gray-200">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-200 transition-all"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-8">
            <h3 className="font-bold text-gray-800 mb-4">Question Tracker</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-bold text-xs transition-all ${
                    currentQuestionIndex === idx
                      ? 'bg-primary-600 text-white ring-2 ring-primary-300 shadow-md'
                      : answers[q._id]
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTaking;
