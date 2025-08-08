// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis';
import Login from './pages/login';      
import Register from './pages/register'; 
import ForgotPassSubmission from './pages/forgotpass_submission';
import ForgotPassword from './pages/forgotpassword';
import { Routes, Route } from 'react-router-dom';
import StudentDashboard from './pages/studentDashboard';
import StudentProposal from './pages/studentProposal';


function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/propose" element={<StudentProposal />} />
        <Route path="/" element={<Home />} />
        <Route path="/synopsis" element={<Synopsis />} />
        <Route path="/login" element={<Login />} />       
        <Route path="/register" element={<Register />} />  
        <Route path="/forgotpass_submission" element={<ForgotPassSubmission />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}


export default App;
