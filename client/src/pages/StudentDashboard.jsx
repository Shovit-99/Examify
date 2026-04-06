import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Award, Bell, Search, Settings, LogOut, ChevronRight, Loader } from 'lucide-react';
import axios from 'axios';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, exams, grades
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) navigate('/');
    else setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchExams();
      fetchGrades();
      fetchAnalytics();
    }
  }, [user]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/exams');
      const sortedExams = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setExams(sortedExams);
      setFilteredExams(sortedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('examifyToken');
      const studentId = user?._id;
      const response = await axios.get(`http://localhost:5000/api/grades/my-grades/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('examifyToken');
      const studentId = user?._id;
      const response = await axios.get(`http://localhost:5000/api/grades/analytics/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      exam.courseCode.toLowerCase().includes(query.toLowerCase()) ||
      exam.instructor.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('examifyUser');
    localStorage.removeItem('examifyToken');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-50 to-blue-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 my-4 ml-4 bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-blue-200 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-800 tracking-tight">Examify</span>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'exams' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
          >
            <Clock className="w-5 h-5" />
            <span>Upcoming Exams</span>
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'grades' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
          >
            <Award className="w-5 h-5" />
            <span>Grades</span>
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
              placeholder="Search for exams, subjects..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-md focus:ring-2 focus:ring-blue-500 text-sm font-medium outline-none"
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
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Student'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pb-10">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {/* Hero Banner */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                
                <div className="relative z-10">
                  <h1 className="text-4xl font-black text-gray-800 mb-2">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-gray-500 font-medium text-lg max-w-md">
                    You have <span className="text-blue-600 font-bold">{filteredExams.length} upcoming exams</span>. Stay focused!
                  </p>
                </div>

                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                  <div className="bg-gray-50 rounded-2xl p-5 flex-1 md:w-32 border border-gray-100 text-center">
                    <p className="text-gray-400 text-sm font-bold mb-1">Average</p>
                    <p className="text-3xl font-black text-gray-800">{analytics?.averagePercentage || '0'}%</p>
                  </div>
                  <div className="bg-blue-600 rounded-2xl p-5 flex-1 md:w-32 text-center shadow-lg shadow-blue-200">
                    <p className="text-blue-100 text-sm font-bold mb-1">Total Exams</p>
                    <p className="text-3xl font-black text-white">{grades.length}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                
                {/* Action Items / Exams */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold text-gray-800">Upcoming Exams</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : filteredExams.length > 0 ? (
                    filteredExams.slice(0, 2).map((exam, idx) => (
                      <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-blue-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl ${idx === 0 ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'} flex items-center justify-center border`}>
                            <BookOpen className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{exam.subject}</h3>
                            <p className="text-sm font-medium text-gray-400 mt-0.5">{exam.courseCode} • {exam.instructor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-gray-800">{exam.timeLimit} Mins</p>
                            <p className="text-xs font-medium text-gray-400">Time Limit</p>
                          </div>
                          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No exams found</p>
                  )}

                  <button 
                    onClick={() => setActiveTab('exams')}
                    className="w-full py-3 text-blue-600 font-bold border-2 border-blue-600 rounded-2xl hover:bg-blue-50 transition-all"
                  >
                    View All Exams
                  </button>
                </div>

                {/* Right Side - Recent Grades */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800">Recent Results</h2>
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-4">
                    {grades.length > 0 ? (
                      grades.slice(0, 3).map((grade, idx) => (
                        <div key={idx} className="pb-4 border-b last:pb-0 last:border-transparent">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-gray-800">{grade.subject}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{grade.marksObtained}/{grade.totalMarks} • {grade.percentage}%</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-6">No grades yet</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* EXAMS TAB */}
          {activeTab === 'exams' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-800 mb-2">Upcoming Exams</h1>
                <p className="text-gray-500">Total: {filteredExams.length} exams</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredExams.length > 0 ? (
                <div className="space-y-4">
                  {filteredExams.map((exam, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 hover:border-blue-300 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{exam.subject}</h3>
                          <p className="text-gray-600 mb-3">{exam.courseCode} • Instructor: {exam.instructor}</p>
                          <div className="flex flex-wrap gap-4">
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Date & Time</p>
                              <p className="text-sm font-bold text-gray-800">{exam.date ? formatDate(exam.date) : '⏳ Not Set'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Duration</p>
                              <p className="text-sm font-bold text-gray-800">{exam.timeLimit ? `${exam.timeLimit} minutes` : '⏳ Not Set'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Total Marks</p>
                              <p className="text-sm font-bold text-gray-800">{exam.totalMarks}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Status</p>
                              <p className={`text-sm font-bold ${exam.date && exam.status === 'scheduled' ? 'text-blue-600' : exam.date && exam.status === 'ongoing' ? 'text-orange-600' : exam.date && exam.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                                {exam.date ? (exam.status.charAt(0).toUpperCase() + exam.status.slice(1)) : '⏳ Pending'}
                              </p>
                            </div>
                          </div>
                          {exam.description && (
                            <p className="text-gray-600 text-sm mt-3">{exam.description}</p>
                          )}
                        </div>
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 shadow-md border border-gray-200 text-center">
                  <p className="text-gray-500 text-lg">No exams found matching your search</p>
                </div>
              )}
            </>
          )}

          {/* GRADES TAB */}
          {activeTab === 'grades' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-800 mb-2">Your Grades</h1>
                {analytics && (
                  <p className="text-gray-500">Average: {analytics.averagePercentage}% • Total Exams: {analytics.totalExams}</p>
                )}
              </div>

              {grades.length > 0 ? (
                <div className="space-y-4">
                  {grades.map((grade, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 hover:border-blue-300 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{grade.subject}</h3>
                          <p className="text-gray-600 text-sm mb-3">{grade.exam?.courseCode}</p>
                          <div className="flex flex-wrap gap-6">
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Marks</p>
                              <p className="text-sm font-bold text-gray-800">{grade.marksObtained}/{grade.totalMarks}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Percentage</p>
                              <p className="text-sm font-bold text-gray-800">{grade.percentage}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold">Attempted On</p>
                              <p className="text-sm font-bold text-gray-800">{formatDate(grade.submittedAt)}</p>
                            </div>
                          </div>
                          {grade.feedback && (
                            <p className="text-gray-600 text-sm mt-3 italic">Feedback: {grade.feedback}</p>
                          )}
                        </div>
                        <div className={`px-6 py-4 rounded-2xl text-center ${getGradeBackgroundColor(grade.grade)}`}>
                          <p className="text-xs text-gray-600 font-bold">Grade</p>
                          <p className={`text-3xl font-black ${getGradeForegroundColor(grade.grade)}`}>
                            {grade.grade}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 shadow-md border border-gray-200 text-center">
                  <p className="text-gray-500 text-lg">No grades available yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
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

const getGradeBackgroundColor = (grade) => {
  const colors = {
    'A+': 'bg-emerald-50',
    'A': 'bg-emerald-50',
    'A-': 'bg-emerald-50',
    'B+': 'bg-blue-50',
    'B': 'bg-blue-50',
    'B-': 'bg-yellow-50',
    'C+': 'bg-orange-50',
    'C': 'bg-orange-50',
    'D': 'bg-red-50',
    'F': 'bg-red-50'
  };
  return colors[grade] || 'bg-gray-50';
};

const getGradeForegroundColor = (grade) => {
  const colors = {
    'A+': 'text-emerald-600',
    'A': 'text-emerald-600',
    'A-': 'text-emerald-600',
    'B+': 'text-blue-600',
    'B': 'text-blue-600',
    'B-': 'text-yellow-600',
    'C+': 'text-orange-600',
    'C': 'text-orange-600',
    'D': 'text-red-600',
    'F': 'text-red-600'
  };
  return colors[grade] || 'text-gray-600';
};

export default StudentDashboard;