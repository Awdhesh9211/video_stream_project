import { Link } from 'react-router-dom';

const VideoItem = ({ video, onDelete }) => {

  return (
    <div className="border rounded p-2 shadow">
      <img
        src={`http://localhost:3000/uploads/${video.thumbnail}`}
        alt={video.title}
        className="w-full h-40 object-cover"
      />
      <h3 className="font-bold mt-2">{video.title}</h3>
      <p className="text-sm">{video.description}</p>
      <div className="flex justify-between mt-2">
        <Link to={`/watch/${video.filename}`} className="text-blue-500">Watch</Link>
        <button onClick={() => onDelete(video._id)} className="text-red-500">Delete</button>
      </div>
    </div>
  );
};

export default VideoItem;
