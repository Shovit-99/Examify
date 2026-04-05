import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Login Route */}
        <Route path="/" element={<Login />} />
        
        {/* The Student Dashboard Route */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} /> {/* Catch-all for both URL types */}
        
        {/* The Teacher Dashboard Route */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        
        {/* The Admin Dashboard Route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;