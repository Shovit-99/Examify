import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Award, Bell, Search, X, LogOut, ChevronRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
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
      initializeNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const initializeNotifications = () => {
    const mockNotifications = [
      { id: 1, type: 'exam', message: 'New exam available: Theory of Computation', time: '2 hours ago', read: false },
      { id: 2, type: 'grade', message: 'Your grade for Software Engineering has been posted', time: '1 day ago', read: false },
      { id: 3, type: 'alert', message: 'Exam deadline in 3 days: Advanced Frontend', time: '2 days ago', read: true },
    ];
    setNotifications(mockNotifications);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read));
    setShowNotifications(false);
  };

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
      (exam.instructor && exam.instructor.toLowerCase().includes(query.toLowerCase()))
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'grade':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 my-4 ml-4 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2.5 rounded-xl text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Examify</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'exams', icon: Clock, label: 'Upcoming Exams' },
            { id: 'grades', icon: Award, label: 'Grades' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary-100 text-primary-600 shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100' 
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto px-4 md:px-8 py-6">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search exams, subjects..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${
                            !notif.read ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={clearNotifications}
                        className="w-full text-sm text-primary-600 hover:text-primary-700 font-semibold text-center py-2 rounded-lg hover:bg-primary-50 transition-all"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer bg-white py-2 px-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pb-10">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 md:p-10 shadow-lg text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-primary-100 text-lg mb-6">
                    You have <span className="font-bold text-white">{filteredExams.length} upcoming exams</span>. Keep pushing forward!
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold mb-1">Average Score</p>
                      <p className="text-2xl font-bold">{analytics?.averagePercentage || '0'}%</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold mb-1">Total Exams</p>
                      <p className="text-2xl font-bold">{grades.length}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold mb-1">Pending</p>
                      <p className="text-2xl font-bold">{filteredExams.length}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold mb-1">Success Rate</p>
                      <p className="text-2xl font-bold">{analytics?.totalExams > 0 ? Math.round((analytics.totalMarksObtained / analytics.totalMarks) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Upcoming Exams */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Upcoming Exams</h2>
                    {filteredExams.length > 2 && (
                      <button 
                        onClick={() => setActiveTab('exams')}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                  ) : filteredExams.length > 0 ? (
                    <div className="space-y-4">
                      {filteredExams.slice(0, 2).map((exam, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${idx === 0 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{exam.subject}</h3>
                                <p className="text-sm text-gray-500 mb-3">{exam.courseCode}{exam.instructor ? ` • ${exam.instructor}` : ''}</p>
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-600">{exam.timeLimit} mins</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-600">📊 {exam.totalMarks} marks</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => navigate(`/exam/${exam._id}`)}
                              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 text-sm whitespace-nowrap"
                            >
                              Start
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
                      <p className="text-gray-500">No upcoming exams</p>
                    </div>
                  )}
                </div>

                {/* Recent Results */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Recent Results</h2>
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 space-y-4">
                    {grades.length > 0 ? (
                      grades.slice(0, 3).map((grade, idx) => (
                        <div key={idx} className="pb-4 border-b border-gray-100 last:pb-0 last:border-0">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{grade.subject}</p>
                              <p className="text-xs text-gray-500">{grade.marksObtained}/{grade.totalMarks}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${grade.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{grade.percentage}%</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-6 text-sm">No grades yet</p>
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
                          <p className="text-gray-600 mb-3">{exam.courseCode}{exam.instructor ? ` • Instructor: ${exam.instructor}` : ''}</p>
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
                        <button 
                          onClick={() => navigate(`/exam/${exam._id}`)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
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
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Grades</h1>
                {analytics && (
                  <p className="text-gray-600">Average: <span className="font-bold text-primary-600">{analytics.averagePercentage}%</span> • Total Exams: <span className="font-bold">{analytics.totalExams}</span></p>
                )}
              </div>

              {/* Analytics Cards */}
              {analytics && analytics.totalExams > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Exams', value: analytics.totalExams, icon: '📋', color: 'from-blue-500 to-blue-600' },
                    { label: 'Average Score', value: `${analytics.averagePercentage}%`, icon: '📊', color: 'from-emerald-500 to-green-600' },
                    { label: 'Total Marks', value: `${analytics.totalMarksObtained}/${analytics.totalMarks}`, icon: '🎯', color: 'from-purple-500 to-indigo-600' },
                    { label: 'Success Rate', value: `${analytics.totalExams > 0 ? Math.round((analytics.totalMarksObtained / analytics.totalMarks) * 100) : 0}%`, icon: '⭐', color: 'from-orange-500 to-red-600' },
                  ].map((card, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-white/80 text-sm font-semibold">{card.label}</p>
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                      <p className="text-3xl font-bold">{card.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Performance Chart */}
              {grades.length > 1 && (
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg border border-gray-200 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">📈 Performance Trend</h2>
                      <p className="text-sm text-gray-500 mt-1">Your journey across {grades.length} exams</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">↗️ {grades.length} Exams</span>
                  </div>
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={grades.map((g, idx) => ({
                      name: `Exam ${idx + 1}`,
                      percentage: g.percentage,
                      marks: g.marksObtained
                    }))} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="percentageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5b7dff" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#5b7dff" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip 
                        formatter={(value) => `${value.toFixed(1)}%`}
                        labelFormatter={(label) => label}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '2px solid #5b7dff', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(91, 125, 255, 0.2)',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                        cursor={{ strokeDasharray: '5 5', stroke: '#5b7dff' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#5b7dff" 
                        strokeWidth={4}
                        name="Percentage (%)"
                        dot={{ fill: '#5b7dff', r: 7, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 10, strokeWidth: 3 }}
                        animationDuration={1200}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Marks Distribution Chart */}
              {grades.length > 0 && (
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-lg border border-gray-200 mb-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">📊 Marks Distribution</h2>
                      <p className="text-sm text-gray-500 mt-1">Obtained vs total marks comparison</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold">🎯 Comparison</span>
                  </div>
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={grades.map((g, idx) => ({
                      name: `Exam ${idx + 1}`,
                      obtained: g.marksObtained,
                      total: g.totalMarks
                    }))} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="obtainedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                        </linearGradient>
                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d1d5db" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip 
                        formatter={(value) => `${value.toFixed(0)}`}
                        labelFormatter={(label) => label}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '2px solid #10b981', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      <Bar 
                        dataKey="obtained" 
                        fill="url(#obtainedGradient)" 
                        name="Marks Obtained" 
                        radius={[12, 12, 0, 0]}
                        animationDuration={1000}
                      />
                      <Bar 
                        dataKey="total" 
                        fill="url(#totalGradient)" 
                        name="Total Marks" 
                        radius={[12, 12, 0, 0]}
                        animationDuration={1200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Grades List */}
              {grades.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Results</h2>
                  {grades.map((grade, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{grade.subject}</h3>
                          <p className="text-gray-600 text-sm mb-4">{grade.exam?.courseCode}</p>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 font-semibold">Marks</p>
                              <p className="text-lg font-bold text-gray-800 mt-1">{grade.marksObtained}/{grade.totalMarks}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 font-semibold">Percentage</p>
                              <p className="text-lg font-bold text-primary-600 mt-1">{grade.percentage}%</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 font-semibold">Date</p>
                              <p className="text-lg font-bold text-gray-800 mt-1">{formatDate(grade.submittedAt).split(',')[0]}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`px-6 py-4 rounded-xl text-center ${getGradeColor(grade.grade)}`}>
                          <p className="text-xs text-gray-700 font-semibold">Grade</p>
                          <p className="text-4xl font-black mt-1">{grade.grade}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
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