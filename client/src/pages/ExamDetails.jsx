import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, Award, Users, FileText, Calendar, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const ExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/exams/single/${examId}`);
      setExam(response.data);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    // Navigate to exam taking page
    navigate(`/exam/${exam._id}/take`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      ongoing: 'bg-orange-50 text-orange-700 border-orange-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      paused: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const isExamAvailable = exam && exam.date && exam.status === 'scheduled';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-bold mb-4">Exam not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-4 md:p-8">
      {/* Header with Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 font-bold mb-6 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Exam Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-800 mb-1">{exam.subject}</h1>
                <p className="text-gray-500 font-medium">{exam.courseCode}</p>
              </div>
            </div>
            <span className={`px-6 py-3 rounded-full text-sm font-bold border ${getStatusColor(exam.status)}`}>
              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
            </span>
          </div>

          {exam.description && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-700">{exam.description}</p>
            </div>
          )}
        </div>

        {/* Exam Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Date & Time</h3>
              </div>
              <p className="text-2xl font-black text-gray-800">
                {exam.date ? formatDate(exam.date) : '⏳ Not Scheduled'}
              </p>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-800">Duration</h3>
              </div>
              <p className="text-2xl font-black text-gray-800">
                {exam.timeLimit ? `${exam.timeLimit} minutes` : '⏳ Not Set'}
              </p>
            </div>

            {/* Instructor */}
            {exam.instructor && (
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Instructor</h3>
                </div>
                <p className="text-lg font-bold text-gray-800">{exam.instructor}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Total Marks */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">Total Marks</h3>
              </div>
              <p className="text-2xl font-black text-gray-800">{exam.totalMarks}</p>
            </div>

            {/* Total Questions */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Total Questions</h3>
              </div>
              <p className="text-2xl font-black text-gray-800">
                {exam.totalQuestions || 'Not specified'}
              </p>
            </div>

            {/* Created By */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-pink-600" />
                <h3 className="text-lg font-bold text-gray-800">Created By</h3>
              </div>
              <p className="text-lg font-bold text-gray-800">{exam.createdBy?.name || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {user?.role === 'teacher' ? (
              <>
                <button
                  onClick={() => navigate(`/exam/${exam._id}/questions`)}
                  className="flex-1 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                  Manage Questions
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
              </>
            ) : isExamAvailable ? (
              <>
                <button
                  onClick={handleStartExam}
                  className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Start Exam Now
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="w-full">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-700 font-bold mb-2">
                    {!exam.date ? 'Exam date not scheduled yet' : `This exam is currently ${exam.status}`}
                  </p>
                  <p className="text-yellow-600 text-sm mb-4">
                    Please check back later or contact your instructor.
                  </p>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
