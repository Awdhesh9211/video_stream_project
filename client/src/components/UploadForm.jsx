import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image } from 'lucide-react';

const UploadForm = ({ onUpload }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
  });

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    await axios.post('http://localhost:3000/api/videos/upload', data);
    alert('Video uploaded!');
    onUpload();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex items-center border rounded-md p-2">
        <FileText className="mr-2 text-gray-500" />
        <input 
          name="title" 
          placeholder="Title" 
          onChange={handleChange} 
          required 
          className="border-none outline-none w-full" 
        />
      </div>
      
      <div className="flex items-center border rounded-md p-2">
        <FileText className="mr-2 text-gray-500" />
        <textarea 
          name="description" 
          placeholder="Description" 
          onChange={handleChange} 
          className="border-none outline-none w-full" 
        />
      </div>
      
      <div className="flex items-center border rounded-md p-2">
        <Upload className="mr-2 text-gray-500" />
        <input 
          type="file" 
          name="video" 
          accept="video/*" 
          required 
          onChange={handleChange} 
          className="border-none outline-none w-full" 
        />
      </div>
      
      <div className="flex items-center border rounded-md p-2">
        <Image className="mr-2 text-gray-500" />
        <input 
          type="file" 
          name="thumbnail" 
          accept="image/*" 
          required 
          onChange={handleChange} 
          className="border-none outline-none w-full" 
        />
      </div>
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
        Upload
      </button>
    </form>
  );
};

export default UploadForm;
