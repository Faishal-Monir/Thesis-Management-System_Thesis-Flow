// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis';
import Login from './pages/login';      
import Register from './pages/register'; 
import { Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/synopsis" element={<Synopsis />} />
        <Route path="/login" element={<Login />} />       
        <Route path="/register" element={<Register />} />  
      </Routes>
    </div>
  );
}


export default App;
