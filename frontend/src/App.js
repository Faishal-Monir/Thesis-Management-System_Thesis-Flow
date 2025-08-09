import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis';
import StudentProposal  from './pages/studentProposal';
import StudentDashboard from './pages/studentDashboard';
import Login from './pages/login';      
import Register from './pages/register'; 
import Resources from './pages/resources';
import ForgotPassSubmission from './pages/forgotpass_submission';
import Mysynopsis from './pages/my_synopsis';
import CreateSynopsis from './pages/create_synopsis';
import DeleteSynopsis from './pages/delete_synopsis';
import UpdateSynopsis from './pages/update_synopsis';
import ForgotPassword from './pages/forgotpassword';




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
        <Route path="/studentproposal" element={<StudentProposal />} />
        <Route path="/studentDashboard" element={<StudentDashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/forgotpass_submission" element={<ForgotPassSubmission />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/my_synopsis" element={<Mysynopsis />} />
        <Route path="/create_synopsis" element={<CreateSynopsis />} />
        <Route path="/delete_synopsis" element={<DeleteSynopsis />} />
        <Route path="/update_synopsis" element={<UpdateSynopsis />} />
      </Routes>
    </div>
  );
}


export default App;
