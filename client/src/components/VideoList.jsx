import axios from 'axios';
import { useEffect, useState } from 'react';
import VideoItem from './VideoItem';

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    const res = await axios.get('http://localhost:3000/api/videos');
    setVideos(res.data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/videos/${id}`);
    fetchVideos();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoItem key={video._id} video={video} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default VideoList;
