import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, BookOpen, Key } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    subject: '',
    registrationCode: ''
  });
  const [error, setError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subjects = [
    'Software Engineering',
    'Theory of Computation',
    'Advance Frontend',
    'Container Technologies',
    'Hydrogen Energy',
    'Technical Training'
  ];

  const roleEmailGuide = {
    student: '@stu (e.g., john@stu.com)',
    teacher: '@teach (e.g., prof@teach.com)',
    admin: '@sym (e.g., admin@sym.com)'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subject and code when role changes
      ...(name === 'role' && { subject: '', registrationCode: '' })
    }));
    setCodeVerified(false);
    setError('');
  };

  const handleVerifyCode = async () => {
    if (!formData.registrationCode.trim()) {
      setError('Please enter a registration code');
      return;
    }

    setVerifyingCode(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/registration-codes/verify',
        { code: formData.registrationCode }
      );

      // Set subject from the verified code
      setFormData(prev => ({
        ...prev,
        subject: response.data.subject
      }));
      setCodeVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid registration code');
      setCodeVerified(false);
    } finally {
      setVerifyingCode(false);
    }
  };

  const validateEmail = () => {
    const emailDomain = {
      student: '@stu',
      teacher: '@teach',
      admin: '@sym'
    };
    
    const requiredDomain = emailDomain[formData.role];
    if (!formData.email.includes(requiredDomain)) {
      setError(`Email must contain "${requiredDomain}" for ${formData.role} role`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email format
      if (!validateEmail()) {
        setLoading(false);
        return;
      }

      // Check if teacher has verified code
      if (formData.role === 'teacher' && !codeVerified) {
        setError('Please verify your registration code first');
        setLoading(false);
        return;
      }

      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'teacher' && { 
          subject: formData.subject,
          registrationCode: formData.registrationCode
        })
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/auth/register',
        payload,
        config
      );

      // Save user and token
      localStorage.setItem('examifyUser', JSON.stringify(data));
      localStorage.setItem('examifyToken', data.token);

      console.log('✅ Registered successfully:', data);

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (data.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-50 to-blue-50 items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-xl text-white">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Join Examify to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg text-sm text-center mb-4 border border-red-300">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Dr. Robert Smith"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              I am a * 
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose your role to proceed</p>
          </div>

          {/* Registration Code - Only for Teachers */}
          {formData.role === 'teacher' && (
            <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Teacher Registration Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="registrationCode"
                  value={formData.registrationCode}
                  onChange={handleChange}
                  placeholder="Enter 8-character code"
                  disabled={codeVerified}
                  maxLength="8"
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none uppercase ${
                    codeVerified 
                      ? 'bg-green-50 border-green-300 text-green-700' 
                      : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || codeVerified || !formData.registrationCode}
                  className={`px-4 py-2.5 rounded-lg font-bold text-white transition-all ${
                    codeVerified
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400'
                  }`}
                >
                  {verifyingCode ? 'Verifying...' : codeVerified ? '✓ Verified' : 'Verify'}
                </button>
              </div>
              {codeVerified && (
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ✓ Code verified for: {formData.subject}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                💡 Get a registration code from an administrator
              </p>
            </div>
          )}

          {/* Subject Selection - Shows after code verification*/}
          {formData.role === 'teacher' && codeVerified && (
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Subject (Auto-filled)
              </label>
              <input
                type="text"
                value={formData.subject}
                disabled
                className="w-full px-4 py-2.5 border border-green-300 rounded-lg bg-white text-gray-700 font-medium"
              />
              <p className="text-xs text-gray-600 mt-2">
                💡 This subject is locked and cannot be changed
              </p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={`e.g., user${roleEmailGuide[formData.role]}`}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must contain: {roleEmailGuide[formData.role]}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                minLength="6"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (formData.role === 'teacher' && !codeVerified)}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-bold text-purple-600 hover:text-purple-700">
              Sign In
            </Link>
          </p>
        </div>

        {/* Email Format Guide */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-bold text-blue-900 mb-2">📧 Email Format Guide:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>👤 Student: user@stu.com</li>
            <li>👨‍🏫 Teacher: prof@teach.com (needs code)</li>
            <li>⚙️ Admin: admin@sym.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
