import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, LogOut, Settings, Bell, Search, X, Calendar, Clock, FileText, Users } from 'lucide-react';
import axios from 'axios';

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [subjects] = useState([
    'Software Engineering',
    'Theory of Computation',
    'Advance Frontend',
    'Container Technologies',
    'Hydrogen Energy',
    'Technical Training'
  ]);
  const [formData, setFormData] = useState({
    subject: '',
    courseCode: '',
    date: '',
    timeLimit: '',
    totalQuestions: '',
    totalMarks: '',
    description: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'teacher') {
        navigate('/');
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('examifyToken');
      const response = await axios.get('http://localhost:5000/api/exams/teacher/my-exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(response.data);
      setFilteredExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Error fetching exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExams(exams);
      return;
    }
    const filtered = exams.filter(exam =>
      exam.subject.toLowerCase().includes(query.toLowerCase()) ||
      exam.courseCode.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        subject: exam.subject,
        courseCode: exam.courseCode,
        date: exam.date ? exam.date.split('T')[0] : '',
        timeLimit: exam.timeLimit || '',
        totalQuestions: exam.totalQuestions || '',
        totalMarks: exam.totalMarks || '',
        description: exam.description || '',
      });
    } else {
      setEditingExam(null);
      setFormData({
        subject: user?.subject || '',
        courseCode: '',
        date: '',
        timeLimit: '',
        totalQuestions: '',
        totalMarks: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setFormData({
      subject: user?.subject || '',
      courseCode: '',
      date: '',
      timeLimit: '',
      totalQuestions: '',
      totalMarks: '',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseCode || !formData.totalMarks) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('examifyToken');
      const payload = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        totalQuestions: formData.totalQuestions ? parseInt(formData.totalQuestions) : 0,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
      };

      if (editingExam) {
        await axios.put(
          `http://localhost:5000/api/exams/teacher/${editingExam._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Exam updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/exams/teacher/create',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Exam created successfully');
      }

      fetchExams();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Error saving exam');
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      const token = localStorage.getItem('examifyToken');
      await axios.delete(
        `http://localhost:5000/api/exams/teacher/${examId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert(error.response?.data?.message || 'Error deleting exam');
    }
  };

  const handleScheduleExam = async (examId, newDate) => {
    try {
      const token = localStorage.getItem('examifyToken');
      await axios.put(
        `http://localhost:5000/api/exams/teacher/${examId}/schedule`,
        { date: newDate, status: 'scheduled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Exam scheduled successfully');
      fetchExams();
    } catch (error) {
      console.error('Error scheduling exam:', error);
      alert(error.response?.data?.message || 'Error scheduling exam');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    localStorage.removeItem('examifyUser');
    localStorage.removeItem('examifyToken');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-50 to-blue-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 my-4 ml-4 bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-purple-200 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-800 tracking-tight">Examify</span>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-purple-100 text-purple-600 rounded-2xl font-bold">
            <BookOpen className="w-5 h-5" />
            <span>My Exams</span>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-purple-100 hover:text-purple-600 rounded-2xl font-medium transition-all text-left"
          >
            <Plus className="w-5 h-5" />
            <span>Create Exam</span>
          </button>
        </nav>

        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto px-4 md:px-8">
        {/* Top Header */}
        <header className="h-24 flex justify-between items-center shrink-0">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-md focus:ring-2 focus:ring-purple-500 text-sm font-medium outline-none"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#f3f4f6]"></span>
            </button>
            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex items-center gap-4 cursor-pointer bg-white py-2 px-4 rounded-full shadow-md border border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Teacher'}</p>
                <p className="text-xs text-gray-400">{user?.subject || 'Loading...'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pb-10">
          {/* Hero Banner */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-gray-800 mb-2">Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
              <p className="text-gray-500 font-medium text-lg max-w-md">
                You have <span className="text-purple-600 font-bold">{exams.length} exams</span> created. Manage your exams efficiently.
              </p>
            </div>

            <button 
              onClick={() => handleOpenModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all relative z-10"
            >
              + Create New Exam
            </button>
          </div>

          {/* Exams Grid */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Your Exams</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading exams...</p>
              </div>
            ) : filteredExams.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredExams.map((exam) => (
                  <div key={exam._id} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{exam.subject}</h3>
                        <p className="text-sm text-gray-400">{exam.courseCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenModal(exam)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(exam._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Marks: {exam.totalMarks} | Questions: {exam.totalQuestions || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duration: {exam.timeLimit ? `${exam.timeLimit} mins` : 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(exam.date)}</span>
                      </div>
                      {exam.description && (
                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                          {exam.description}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        exam.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                        exam.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        exam.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {exam.status?.charAt(0).toUpperCase() + exam.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 shadow-md border border-gray-200 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">No exams yet</p>
                <p className="text-gray-400 mb-6">Create your first exam to get started</p>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-2xl font-bold transition-all"
                >
                  + Create Exam
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingExam ? 'Edit Exam' : 'Create New Exam'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your subject is locked for this role</p>
                </div>

                {/* Course Code */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    placeholder="e.g., CS-404"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Total Questions */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Questions</label>
                  <input
                    type="number"
                    name="totalQuestions"
                    value={formData.totalQuestions}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add exam details, instructions, topics covered..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;