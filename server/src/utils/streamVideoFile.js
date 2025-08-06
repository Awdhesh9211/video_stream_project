// utils/streamVideoFile.js
const fs = require("fs");
const path = require("path");

function streamVideoFile(req, res, videoPath) {
    console.log("\n\n🎬 Requested Video Stream");
    console.log("📁 File Path:", videoPath);

    try {
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        console.log("📏 Video Size:", fileSize, "bytes" ,(fileSize/(1024*1024)).toFixed(2),"MB");

        const range = req.headers.range;
        if (!range) {
            console.warn("❌ Missing Range Header");
            res.status(400).send("Requires Range header");
            return;
        }

        const chunkSize = 10 ** 6 * 10; // 10MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, fileSize - 1);
        const contentLength = end - start + 1;

        console.log(`📦 Streaming Bytes: ${start} - ${end}`);
        console.log("📦 Chunk Size:", contentLength);

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4'
        };

        res.writeHead(206, headers);

        const fileStream = fs.createReadStream(videoPath, { start, end });

        fileStream.on("open", () => {
            console.log("🚀 Stream Opened - Sending Chunk...");
        });

        fileStream.on("end", () => {
            console.log("✅ Stream Ended");
        });

        fileStream.on("error", (err) => {
            console.error("🔥 Stream Error:", err);
            res.end(err);
        });

        fileStream.pipe(res);
    } catch (err) {
        console.error("❌ Error accessing video file:", err.message);
        res.status(500).send("Internal Server Error");
    }
}

module.exports= streamVideoFile;
