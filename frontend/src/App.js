// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Resources from './pages/resources';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} /> {/* ✅ */}
      </Routes>
    </div>
  );
}

export default App;
