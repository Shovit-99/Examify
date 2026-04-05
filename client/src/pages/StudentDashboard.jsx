import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Award, Bell, Search, Settings, LogOut, ChevronRight } from 'lucide-react';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) navigate('/');
    else setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('examifyUser');
    navigate('/');
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
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-blue-100 text-blue-600 rounded-2xl font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-2xl font-medium transition-all">
            <Clock className="w-5 h-5" />
            <span>Upcoming Exams</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-2xl font-medium transition-all">
            <Award className="w-5 h-5" />
            <span>Grades</span>
          </a>
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
          
          {/* Hero Banner */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-gray-800 mb-2">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-gray-500 font-medium text-lg max-w-md">
                You have <span className="text-blue-600 font-bold">2 assignments</span> and <span className="text-blue-600 font-bold">1 exam</span> this week. Stay focused!
              </p>
            </div>

            <div className="flex gap-4 relative z-10 w-full md:w-auto">
              <div className="bg-gray-50 rounded-2xl p-5 flex-1 md:w-32 border border-gray-100 text-center">
                <p className="text-gray-400 text-sm font-bold mb-1">GPA</p>
                <p className="text-3xl font-black text-gray-800">3.8</p>
              </div>
              <div className="bg-blue-600 rounded-2xl p-5 flex-1 md:w-32 text-center shadow-lg shadow-blue-200">
                <p className="text-blue-100 text-sm font-bold mb-1">Rank</p>
                <p className="text-3xl font-black text-white">#12</p>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            
            {/* Action Items / Exams */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Exams</h2>
              
              {/* Exam Card 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Computer Networks</h3>
                    <p className="text-sm font-medium text-gray-400 mt-0.5">CS-404 • Dr. Sharma</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-gray-800">45 Mins</p>
                    <p className="text-xs font-medium text-gray-400">Time Limit</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Exam Card 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Database Systems</h3>
                    <p className="text-sm font-medium text-gray-400 mt-0.5">CS-302 • Prof. Lee</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-gray-800">90 Mins</p>
                    <p className="text-xs font-medium text-gray-400">Time Limit</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Side - Schedule */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200">
                
                <div className="relative pl-6 pb-6 border-l-2 border-gray-100 last:pb-0 last:border-transparent">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <p className="text-sm font-bold text-blue-600 mb-1">09:00 AM</p>
                  <p className="font-bold text-gray-800">Machine Learning Lecture</p>
                  <p className="text-sm font-medium text-gray-400">Room 304</p>
                </div>

                <div className="relative pl-6 pb-6 border-l-2 border-gray-100 last:pb-0 last:border-transparent">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                  <p className="text-sm font-bold text-gray-400 mb-1">11:30 AM</p>
                  <p className="font-bold text-gray-800">Project Group Meeting</p>
                  <p className="text-sm font-medium text-gray-400">Library Lab B</p>
                </div>

                <div className="relative pl-6 pb-6 border-l-2 border-gray-100 last:pb-0 last:border-transparent">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                  <p className="text-sm font-bold text-gray-400 mb-1">02:00 PM</p>
                  <p className="font-bold text-gray-800">Cloud Computing Quiz</p>
                  <p className="text-sm font-medium text-gray-400">Online Portal</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;