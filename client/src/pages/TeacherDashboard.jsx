import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, LogOut, Settings, Bell, Search } from 'lucide-react';

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([
    { id: 1, title: 'Computer Networks', code: 'CS-404', students: 45, date: '2026-04-10' },
    { id: 2, title: 'Database Systems', code: 'CS-302', students: 38, date: '2026-04-15' },
  ]);
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
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-purple-100 text-purple-600 rounded-2xl font-bold transition-all">
            <BookOpen className="w-5 h-5" />
            <span>My Exams</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-purple-100 hover:text-purple-600 rounded-2xl font-medium transition-all">
            <Plus className="w-5 h-5" />
            <span>Create Exam</span>
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
              placeholder="Search exams..." 
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
                <p className="text-xs text-gray-400">Teacher</p>
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

            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all">
              + Create New Exam
            </button>
          </div>

          {/* Exams Grid */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Your Exams</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{exam.title}</h3>
                      <p className="text-sm text-gray-400">{exam.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{exam.students} Students</span>
                    <span className="text-gray-500 text-sm">{exam.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;