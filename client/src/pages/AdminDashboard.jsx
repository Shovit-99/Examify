import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trash2, LogOut, Settings, Bell, Search, Edit2 } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@stu.com', role: 'student', joinDate: '2026-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@teach.com', role: 'teacher', joinDate: '2026-01-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@stu.com', role: 'student', joinDate: '2026-02-01' },
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

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-red-50 to-orange-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 my-4 ml-4 bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-red-200 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-800 tracking-tight">Examify</span>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-red-100 text-red-600 rounded-2xl font-bold transition-all">
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-2xl font-medium transition-all">
            <BookOpen className="w-5 h-5" />
            <span>Manage Exams</span>
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
              placeholder="Search users..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-md focus:ring-2 focus:ring-red-500 text-sm font-medium outline-none"
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
                <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pb-10">
          {/* Hero Banner */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-gray-800 mb-2">Welcome, {user?.name?.split(' ')[0]}! 👨‍💼</h1>
              <p className="text-gray-500 font-medium text-lg max-w-md">
                Total Users: <span className="text-red-600 font-bold">{users.length}</span>. Manage the entire system.
              </p>
            </div>

            <div className="flex gap-4 relative z-10">
              <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
                <p className="text-gray-400 text-sm font-bold mb-1">Total Users</p>
                <p className="text-3xl font-black text-gray-800">{users.length}</p>
              </div>
              <div className="bg-red-600 rounded-2xl p-5 text-center shadow-lg shadow-red-200">
                <p className="text-red-100 text-sm font-bold mb-1">Active</p>
                <p className="text-3xl font-black text-white">{users.length}</p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">System Users</h2>
            <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Join Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-600' :
                            u.role === 'teacher' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.joinDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;