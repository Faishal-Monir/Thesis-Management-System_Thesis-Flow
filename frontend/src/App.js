// frontend/src/App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Synopsis from './pages/Synopsis'; // <-- import the page
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/synopsis" element={<Synopsis />} /> {/* <-- add this line */}
      </Routes>
    </div>
  );
}

export default App;
