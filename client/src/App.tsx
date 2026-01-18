import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function Home() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '2rem' }}>Welcome to Startup Validator</h1>
      <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
        Transform your startup ideas into investor-ready pitches
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/register" style={{ color: 'white', textDecoration: 'none', padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', fontWeight: '600', border: '2px solid white', cursor: 'pointer', transition: 'all 0.3s' }}>
          Get Started
        </a>
        <a href="/login" style={{ color: '#667eea', textDecoration: 'none', padding: '0.75rem 2rem', background: 'white', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>
          Sign In
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
