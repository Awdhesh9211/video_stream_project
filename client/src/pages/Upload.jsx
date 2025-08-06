import UploadForm from "../components/UploadForm";

const Upload = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📤 Upload Video</h2>
      <UploadForm onUpload={() => window.location.replace("/")} />
    </div>
  );
};

export default Upload;
