const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");
const { mixAndMaster } = require("../utils/ffmpegMixer");
const Music = require("../models/Music");
const mongoose = require("mongoose");

const allowedTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedTypes.has(file.mimetype) || file.mimetype.startsWith("audio/")) return cb(null, true);
    return cb(new Error("Invalid file type. Only audio files allowed."));
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per stem
});

router.post("/", auth, checkRole(["musician", "producer", "label"]), upload.array("stems", 16), async (req, res) => {
  if (!req.files || req.files.length < 1) return res.status(400).json({ error: "Upload at least one stem using field name 'stems'" });

  const tmpDir = os.tmpdir();
  const tmpPaths = [];

  try {
    // Persist buffers to temp files for ffmpeg
    for (const f of req.files) {
      const ext = path.extname(f.originalname) || ".wav";
      const p = path.join(tmpDir, `mixstem_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
      fs.writeFileSync(p, f.buffer);
      tmpPaths.push(p);
    }

    const { buffer, durationSec } = await mixAndMaster(tmpPaths);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=\"mix.wav\"");
    res.setHeader("X-Mix-Duration", String(durationSec ?? ""));
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("/api/mix error:", err);
    return res.status(500).json({ error: "Mixing failed", details: String(err.message || err) });
  } finally {
    // Cleanup tmp stems
    for (const p of tmpPaths) {
      try { fs.existsSync(p) && fs.unlinkSync(p); } catch {}
    }
  }
});

// In-memory simple job store (reset on server restart)
const jobs = new Map();

// Enhance a single track (authenticated users)
router.post("/enhance", auth, async (req, res) => {
  try {
    const { trackId } = req.body || {};
    if (!trackId || !mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: "Invalid or missing trackId" });
    }

    const track = await Music.findById(trackId);
    if (!track) return res.status(404).json({ message: "Track not found" });

    // Resolve input path (support local only for now)
    let inputPath;
    if (track.source === 'local' && track.fileUrl) {
      const filename = path.basename(track.fileUrl);
      inputPath = path.join(__dirname, "..", "uploads", filename);
      if (!fs.existsSync(inputPath)) {
        return res.status(404).json({ message: "Audio file not found on server" });
      }
    } else {
      return res.status(400).json({ message: "Only locally uploaded tracks are supported for enhancement currently" });
    }

    const jobId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    jobs.set(jobId, { status: 'processing', progress: 0 });

    // Process asynchronously so client can poll right away
    setImmediate(async () => {
      try {
        const { buffer } = await mixAndMaster([inputPath]);
        const outPath = path.join(os.tmpdir(), `enhanced_${jobId}.wav`);
        fs.writeFileSync(outPath, buffer);
        jobs.set(jobId, { status: 'completed', progress: 100, resultPath: outPath });
      } catch (err) {
        jobs.set(jobId, { status: 'failed', progress: 0, error: String(err?.message || err) });
      }
    });

    return res.status(200).json({ jobId });
  } catch (err) {
    console.error('/api/mix/enhance error', err);
    return res.status(500).json({ message: 'Enhancement failed' });
  }
});

// Job status endpoint for polling
router.get('/jobs/:jobId', auth, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  const payload = { status: job.status, progress: job.progress };
  if (job.status === 'completed') {
    payload.resultUrl = `/api/mix/result/${req.params.jobId}`;
  }
  if (job.status === 'failed') {
    payload.error = job.error;
  }
  return res.json(payload);
});

// Serve enhanced audio result
router.get('/result/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'completed' || !job.resultPath) {
    return res.status(404).json({ message: 'Result not found' });
  }
  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Content-Disposition', 'inline; filename="enhanced.wav"');
  const stream = fs.createReadStream(job.resultPath);
  stream.on('error', () => res.status(500).end());
  stream.pipe(res);
});

module.exports = router;
