const express = require("express");
const multer = require("multer");
const path = require("path");
const Video = require("../models/Video");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.fieldname === "thumbnail" ? "thumbnails" : "videos";
    cb(null, path.join(__dirname, "../../uploads", type));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = new Video({
      title,
      description,
      thumbnail: req.files.thumbnail[0].filename,
      filename: req.files.video[0].filename,
    });
    await video.save();
    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

router.get("/stream/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../../uploads/videos", req.params.filename);
  require("../utils/streamVideoFile")(req, res, filePath);
});

router.delete("/:id", async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }
  const videoPath = path.join(__dirname, "../../uploads/videos", video.filename);
  const thumbnailPath = path.join(__dirname, "../../uploads/thumbnails", video.thumbnail);
  // Remove video and thumbnail files from disk
  require("fs").unlinkSync(videoPath);
  require("fs").unlinkSync(thumbnailPath);
  await Video.findByIdAndDelete(req.params.id);
  res.json({ message: "Video deleted" });
});

module.exports = router;
