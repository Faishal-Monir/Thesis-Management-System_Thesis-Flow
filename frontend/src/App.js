// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentProposal from './pages/studentProposal';
import StudentDashboard from './pages/studentDashboard';
import { Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Dashboard" element={<StudentDashboard />} />    
        <Route path="/studentProposal" element={<StudentProposal />} />
      </Routes>
    </div>
  );
}


export default App;
