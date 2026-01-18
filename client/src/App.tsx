import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <LandingPage />
    </Router>
  );
}

export default App;
