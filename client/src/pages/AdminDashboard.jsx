import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Key, LogOut, Settings, Bell, Search, Trash2, Plus, Copy, Check } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('codes'); // codes, users
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [copyiedCode, setCopyiedCode] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Software Engineering');
  const navigate = useNavigate();

  const subjects = [
    'Software Engineering',
    'Theory of Computation',
    'Advance Frontend',
    'Container Technologies',
    'Hydrogen Energy',
    'Technical Training'
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('examifyUser');
    if (!storedUser) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        navigate('/');
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (user && activeTab === 'codes') {
      fetchRegistrationCodes();
    }
  }, [user, activeTab]);

  const fetchRegistrationCodes = async () => {
    try {
      setLoadingCodes(true);
      const token = localStorage.getItem('examifyToken');
      const response = await axios.get('http://localhost:5000/api/registration-codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrationCodes(response.data);
    } catch (error) {
      console.error('Error fetching codes:', error);
      alert('Error fetching registration codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const token = localStorage.getItem('examifyToken');
      const response = await axios.post(
        'http://localhost:5000/api/registration-codes/create',
        { subject: selectedSubject, expiryDays: 30 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`✓ Code generated: ${response.data.code}`);
      fetchRegistrationCodes();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error generating code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopyiedCode(code);
    setTimeout(() => setCopyiedCode(null), 2000);
  };

  const handleRevokeCode = async (codeId) => {
    if (!window.confirm('Are you sure you want to revoke this code? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('examifyToken');
      await axios.delete(`http://localhost:5000/api/registration-codes/${codeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Code revoked successfully');
      fetchRegistrationCodes();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error revoking code');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('examifyUser');
    localStorage.removeItem('examifyToken');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <button
            onClick={() => setActiveTab('codes')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'codes'
                ? 'bg-red-100 text-red-600'
                : 'text-gray-500 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Key className="w-5 h-5" />
            <span>Registration Codes</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'users'
                ? 'bg-red-100 text-red-600'
                : 'text-gray-500 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
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
              placeholder="Search..."
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
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pb-10">
          {/* REGISTRATION CODES TAB */}
          {activeTab === 'codes' && (
            <>
              {/* Hero Banner */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden mb-8">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10">
                  <h1 className="text-4xl font-black text-gray-800 mb-2">Teacher Registration Codes</h1>
                  <p className="text-gray-500 font-medium text-lg max-w-md">
                    Generate secure registration codes for new teachers
                  </p>
                </div>

                <div className="relative z-10">
                  <div className="bg-red-600 rounded-2xl p-6 text-center shadow-lg shadow-red-200">
                    <p className="text-red-100 text-sm font-bold mb-1">Total Codes</p>
                    <p className="text-3xl font-black text-white">{registrationCodes.length}</p>
                  </div>
                </div>
              </div>

              {/* Generate Code Section */}
              <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-red-600" />
                  Generate New Code
                </h2>

                <div className="max-w-md">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Subject for this Code</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white mb-4"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Key className="w-5 h-5" />
                    {generatingCode ? 'Generating...' : 'Generate Code'}
                  </button>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-bold text-blue-900 mb-2">💡 Tips:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>✓ Each code is 8 characters unique</li>
                      <li>✓ Codes expire after 30 days</li>
                      <li>✓ Each code can only be used once</li>
                      <li>✓ Share code with your approved teacher</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Registration Codes List */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Codes</h2>

                {loadingCodes ? (
                  <div className="bg-white rounded-3xl p-12 shadow-md border border-gray-200 text-center">
                    <p className="text-gray-500">Loading codes...</p>
                  </div>
                ) : registrationCodes.length > 0 ? (
                  <div className="grid gap-4">
                    {registrationCodes.map(code => {
                      const isExpired = new Date(code.expiresAt) < new Date();
                      const isUsed = code.isUsed;

                      return (
                        <div
                          key={code._id}
                          className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Code Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono font-bold text-gray-800 text-lg">
                                  {code.code}
                                </code>
                                <button
                                  onClick={() => handleCopyCode(code.code)}
                                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                                >
                                  {copyiedCode === code.code ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Copy className="w-5 h-5" />
                                  )}
                                </button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">SUBJECT</p>
                                  <p className="text-gray-800 font-bold">{code.subject}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">STATUS</p>
                                  <p className={`font-bold ${isUsed ? 'text-green-600' : 'text-blue-600'}`}>
                                    {isUsed ? '✓ Used' : '○ Unused'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">EXPIRES</p>
                                  <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatDate(code.expiresAt)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">CREATED</p>
                                  <p className="text-gray-800 font-bold">{formatDate(code.createdAt)}</p>
                                </div>
                              </div>

                              {isUsed && code.usedBy && (
                                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200 text-xs text-green-800">
                                  <p className="font-semibold">Used by: {code.usedBy.name} ({code.usedBy.email})</p>
                                  <p>Used at: {formatDate(code.usedAt)}</p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {!isUsed && (
                                <button
                                  onClick={() => handleRevokeCode(code._id)}
                                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex gap-2 mt-4">
                            {isExpired && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                EXPIRED
                              </span>
                            )}
                            {isUsed && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                USED
                              </span>
                            )}
                            {!isUsed && !isExpired && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 shadow-md border border-gray-200 text-center">
                    <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No codes generated yet</p>
                    <p className="text-gray-400">Generate your first code above to get started</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-md border border-gray-200 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black text-gray-800 mb-2">Manage Users</h1>
                  <p className="text-gray-500 font-medium text-lg">View and manage all system users</p>
                </div>
              </div>
              <p className="text-gray-500 text-center mt-8">Coming soon...</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;