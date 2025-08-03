// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis'; 
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/synopsis" element={<Synopsis />} />
      </Routes>
    </div>
  );
}

export default App;
