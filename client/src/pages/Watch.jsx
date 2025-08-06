import { useParams } from "react-router-dom";
import StreamingVideoPlayer from "../components/StreamingVideoPlayer";

const Watch = () => {
  const { filename } = useParams();
  const videoUrl = `http://localhost:3000/api/videos/stream/${filename}`;

  return (
    <div className="min-h-screen bg-black text-white">
      <StreamingVideoPlayer videoPath={videoUrl} />
    </div>
  );
};

export default Watch;
