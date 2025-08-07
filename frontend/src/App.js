// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis';
import Login from './pages/login';      
import Register from './pages/register'; 
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
      </Routes>
    </div>
  );
}


export default App;
