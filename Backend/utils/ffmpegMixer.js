const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

function buildFilterComplex(n) {
  // Mix N inputs, then apply simple mastering chain
  // loudnorm (EBU R128), highpass, compressor, limiter
  const post = `amix=inputs=${n}:normalize=0:duration=longest,highpass=f=30,` +
               `acompressor=threshold=-18dB:ratio=3:attack=10:release=80,` +
               `loudnorm=I=-14:TP=-1.0:LRA=11,alimiter=limit=1.0`;
  // Prepend input labels
  const labels = Array.from({ length: n }, (_, i) => `[${i}:a]`).join("");
  return labels + post;
}

async function mixAndMaster(inputPaths) {
  if (!inputPaths || inputPaths.length === 0) throw new Error("No inputs");

  const tmpOut = path.join(os.tmpdir(), `mixout_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);

  await new Promise((resolve, reject) => {
    let cmd = ffmpeg();
    inputPaths.forEach((p) => (cmd = cmd.input(p)));

    cmd
      .complexFilter(buildFilterComplex(inputPaths.length))
      .audioCodec("pcm_s16le")
      .format("wav")
      .outputOptions(["-ac 2", "-ar 48000"]) // stereo 48k
      .on("error", (err) => reject(err))
      .on("end", () => resolve())
      .save(tmpOut);
  });

  const buffer = fs.readFileSync(tmpOut);
  let durationSec = undefined;
  try {
    // quick duration probe via ffprobe if available
    durationSec = await new Promise((resolve) => {
      ffmpeg.ffprobe(tmpOut, (err, data) => {
        if (err) return resolve(undefined);
        const s = data?.format?.duration;
        resolve(s ? Number(s) : undefined);
      });
    });
  } catch {}

  try { fs.unlinkSync(tmpOut); } catch {}
  return { buffer, durationSec };
}

module.exports = { mixAndMaster };
