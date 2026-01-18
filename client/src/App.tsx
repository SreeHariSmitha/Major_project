import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Register from './pages/Register';
import './App.css';

function Home() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <h1>Welcome to Startup Validator</h1>
      <p>
        <a href="/register" style={{ color: '#667eea', textDecoration: 'none' }}>
          Create Account
        </a>
      </p>
    </div>
  );
}

function Login() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <h1>Login</h1>
      <p>Login page coming soon...</p>
      <p>
        <a href="/register" style={{ color: '#667eea', textDecoration: 'none' }}>
          Create an account instead
        </a>
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
