import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-gray-800 text-white p-4 flex justify-between">
    <h1 className="font-bold text-xl">🎬 VideoApp</h1>
    <div className="space-x-4">
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
    </div>
  </nav>
);

export default Navbar;
