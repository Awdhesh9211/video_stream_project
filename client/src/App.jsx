import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Watch from './pages/Watch';

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/watch/:filename" element={<Watch />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
