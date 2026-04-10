import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, BookOpen } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors

    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };

      // Sending the request to your backend
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        config
      );

      // High-End Security: Save the JWT token to local storage
      localStorage.setItem('examifyUser', JSON.stringify(data));
      localStorage.setItem('examifyToken', data.token);

      console.log('✅ Logged in successfully:', data);

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      // Catch backend errors (like wrong password) and show them on the UI
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-50 to-blue-50 items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-xl text-white">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg text-sm text-center mb-4 border border-red-300">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-purple-600 hover:text-purple-700">
              Sign up
            </Link>
          </p>
        </div>

        {/* Email Format Guide */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-bold text-blue-900 mb-2">📧 Demo Accounts:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>👤 Student: student@stu.com | Pass: 123456</li>
            <li>👨‍🏫 Teacher: prof@teach.com | Pass: 123456</li>
            <li>⚙️ Admin: admin@sym.com | Pass: 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;