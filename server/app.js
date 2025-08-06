const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
console.log(path.join(__dirname, "uploads","thumbnails"));
app.use("/uploads", express.static(path.join(__dirname, "uploads","thumbnails")));
app.use("/api/videos", require("./src/routes/video.routes.js"));

mongoose.connect("mongodb://localhost:27017/videodb")
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB Error", err));
