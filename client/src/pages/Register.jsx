import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, BookOpen, Key, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    subject: '',
    registrationCode: '',
    instructor: ''
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

  const instructors = [
    'Dr. Deekshant Semwal',
    'Dr. Jigyasa Arora',
    'Dr. Sunil Ghlidiyal',
    'Dr. Garima Verma',
    'Dr. Abhishek',
    'Mr. Amit Srivastava'
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
      ...(name === 'role' && { subject: '', registrationCode: '', instructor: '' })
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
      if (!validateEmail()) {
        setLoading(false);
        return;
      }

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
          registrationCode: formData.registrationCode,
          instructor: formData.instructor || undefined
        })
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/auth/register',
        payload,
        config
      );

      localStorage.setItem('examifyUser', JSON.stringify(data));
      localStorage.setItem('examifyToken', data.token);

      console.log('✅ Registered successfully:', data);

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 px-6 sm:px-8 py-8 sm:py-12">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-primary-100 text-sm font-medium">Join Examify today</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-6 sm:px-8 py-8 sm:py-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium transition-all"
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose your role to continue</p>
              </div>

              {/* Registration Code - Only for Teachers */}
              {formData.role === 'teacher' && (
                <div className={`rounded-lg p-4 border-2 transition-all ${codeVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Teacher Registration Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="registrationCode"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      placeholder="Enter 8-char code"
                      disabled={codeVerified || loading}
                      maxLength="8"
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm font-medium uppercase transition-all ${
                        codeVerified 
                          ? 'bg-white border-emerald-300 text-emerald-700' 
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verifyingCode || codeVerified || !formData.registrationCode || loading}
                      className={`px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-all whitespace-nowrap ${
                        codeVerified
                          ? 'bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2'
                          : 'bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400'
                      }`}
                    >
                      {codeVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </>
                      ) : verifyingCode ? (
                        'Verifying...'
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  {codeVerified && (
                    <p className="text-xs text-emerald-700 mt-3 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Code verified for: {formData.subject}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">Get a code from an administrator</p>
                </div>
              )}

              {/* Subject Display - After Teacher Code Verification */}
              {formData.role === 'teacher' && codeVerified && (
                <div className="rounded-lg p-4 bg-emerald-50 border border-emerald-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject (Locked)</label>
                  <input
                    type="text"
                    value={formData.subject}
                    disabled
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg bg-white text-emerald-700 font-medium text-sm"
                  />
                </div>
              )}

              {/* Instructor Selection - For Teachers */}
              {formData.role === 'teacher' && codeVerified && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Instructor Name (Optional)</label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all"
                  >
                    <option value="">-- Select your name --</option>
                    {instructors.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={`user${roleEmailGuide[formData.role]}`}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must end with: {roleEmailGuide[formData.role]}</p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    minLength="6"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (formData.role === 'teacher' && !codeVerified)}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 Examify. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
