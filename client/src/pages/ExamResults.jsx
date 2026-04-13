import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (examId) {
      fetchExamResults();
    }
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('examifyToken');
      
      const response = await axios.get(
        `http://localhost:5000/api/grades/exam/${examId}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && Array.isArray(response.data.results)) {
        setExamData(response.data.exam);
        setResults(response.data.results);
        
        // Calculate statistics
        const stats = calculateStats(response.data.results, response.data.exam);
        setStats(stats);
        
        // Calculate grade distribution
        const distribution = calculateGradeDistribution(response.data.results);
        setGradeDistribution(distribution);
      } else {
        setError('No results found for this exam');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.message || 'Error fetching exam results');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (resultsData, exam) => {
    if (!resultsData || resultsData.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: '0',
        passCount: 0,
        highestScore: 0,
        lowestScore: 0,
        totalMarks: exam?.totalMarks || 0
      };
    }

    // Get the exam's total marks (same for all students)
    const examTotalMarks = resultsData[0]?.totalMarks || exam?.totalMarks || 100;
    
    const totalAttempts = resultsData.length;
    const totalObtainedMarks = resultsData.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
    const averageScore = (totalObtainedMarks / totalAttempts).toFixed(2);
    const averagePercentage = ((averageScore / examTotalMarks) * 100).toFixed(2);
    const passCount = resultsData.filter(r => r.marksObtained >= (examTotalMarks * 0.4)).length;
    const highestScore = Math.max(...resultsData.map(r => r.marksObtained || 0));
    const lowestScore = Math.min(...resultsData.map(r => r.marksObtained || 0));

    return {
      totalAttempts,
      averageScore,
      averagePercentage,
      passCount,
      highestScore,
      lowestScore,
      totalMarks: examTotalMarks
    };
  };

  const calculateGradeDistribution = (resultsData) => {
    const grades = {};
    resultsData.forEach(result => {
      const grade = result.grade || 'N/A';
      grades[grade] = (grades[grade] || 0) + 1;
    });

    return Object.entries(grades).map(([grade, count]) => ({
      name: grade,
      count,
      value: count
    }));
  };

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

  const downloadResults = () => {
    if (!results || results.length === 0) {
      alert('No results to download');
      return;
    }

    let csv = 'Rank,Student Name,Email,Marks Obtained,Total Marks,Percentage,Grade,Submitted At\n';
    results.forEach((result, idx) => {
      const submittedAt = result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : '-';
      csv += `${idx + 1},"${result.student?.name || '-'}","${result.student?.email || '-'}",${result.marksObtained || 0},${result.totalMarks || 0},${result.percentage || 0}%,${result.grade || '-'},"${submittedAt}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${examData?.subject || 'Exam'}_Results.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-800 font-bold text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{examData?.subject || 'Exam Results'}</h1>
            <p className="text-gray-600 mt-2">{examData?.courseCode || ''} • <span className="font-bold text-primary-600">{results.length} students attempted</span></p>
          </div>
          <button
            onClick={downloadResults}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Download CSV
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-blue-100 text-sm font-semibold mb-2">Total Attempts</p>
              <p className="text-4xl font-bold">{stats.totalAttempts}</p>
              <p className="text-blue-200 text-xs mt-2">students submitted</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-emerald-100 text-sm font-semibold mb-2">Average Score</p>
              <p className="text-4xl font-bold">{stats.averageScore}</p>
              <p className="text-emerald-200 text-xs mt-2">{stats.averagePercentage}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-purple-100 text-sm font-semibold mb-2">Pass Rate</p>
              <p className="text-4xl font-bold">{stats.passCount}/{stats.totalAttempts}</p>
              <p className="text-purple-200 text-xs mt-2">{stats.totalAttempts > 0 ? Math.round((stats.passCount / stats.totalAttempts) * 100) : 0}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <p className="text-orange-100 text-sm font-semibold mb-2">Score Range</p>
              <p className="text-2xl font-bold">{stats.highestScore}/{stats.lowestScore}</p>
              <p className="text-orange-200 text-xs mt-2">highest/lowest</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      {results.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Grade Distribution */}
          {gradeDistribution && gradeDistribution.length > 0 && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📈 Grade Distribution</h2>
                  <p className="text-sm text-gray-500 mt-1">Student performance breakdown</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getGradeChartColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} student${value > 1 ? 's' : ''}`}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                {gradeDistribution.map((grade) => (
                  <div key={grade.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getGradeChartColor(grade.name) }}></div>
                    <span className="text-gray-600">{grade.name}: <span className="font-bold">{grade.count}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marks Distribution Bar Chart */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">📊 Marks Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Student-wise performance</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={results.slice(0, 15).map((r) => ({
                name: r.student?.name?.split(' ')[0] || 'Student',
                marks: r.marksObtained || 0,
                percentage: r.percentage || 0,
                fullName: r.student?.name || 'Unknown'
              }))} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                <defs>
                  <linearGradient id="marksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b7dff" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3b53cc" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  formatter={(value) => `${value.toFixed(1)}`}
                  labelFormatter={(label) => `Marks: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '2px solid #5b7dff', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(91, 125, 255, 0.2)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                  cursor={{ fill: 'rgba(91, 125, 255, 0.1)' }}
                />
                <Bar 
                  dataKey="marks" 
                  fill="url(#marksGradient)" 
                  name="Marks Obtained" 
                  radius={[12, 12, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
            {results.length > 15 && (
              <p className="text-xs text-gray-500 text-center mt-4 font-medium">Showing top 15 students (sorted by marks)</p>
            )}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📋 Student Results</h2>
          {results.length > 0 && (
            <span className="text-sm bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold">
              {results.length} Result{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Marks</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Percentage</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result, idx) => (
                  <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">#{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{result.student?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{result.student?.email || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-center text-primary-600">{result.marksObtained || 0}/{result.totalMarks || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-center text-primary-600">{result.percentage || 0}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold inline-block ${getGradeColor(result.grade)}`}>
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No student results yet</p>
            <p className="text-gray-400 text-sm mt-2">Students who submit exams will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getGradeChartColor = (grade) => {
  const colors = {
    'A+': '#10b981', // Emerald
    'A': '#34d399', // Light Emerald
    'A-': '#6ee7b7', // Lighter Emerald
    'B+': '#3b82f6', // Blue
    'B': '#60a5fa', // Light Blue
    'B-': '#fbbf24', // Amber
    'C+': '#f97316', // Orange
    'C': '#fb923c', // Light Orange
    'D': '#f87171', // Light Red
    'F': '#ef4444'  // Red
  };
  return colors[grade] || '#9ca3af'; // Gray default
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

export default ExamResults;
