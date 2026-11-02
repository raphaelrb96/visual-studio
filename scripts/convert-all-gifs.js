const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const sourceDir = path.resolve('..', 'temp_media', 'extracted');
const destDir = path.resolve('public', 'templates', 'previews');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const mp4Files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp4'));
console.log(`Found ${mp4Files.length} MP4 files to convert.`);

const CONCURRENCY = 4;
let active = 0;
let index = 0;
let completed = 0;
const startTotal = Date.now();

function runNext() {
  if (index >= mp4Files.length) {
    if (active === 0) {
      console.log(`ALL_GIFS_COMPLETED in ${((Date.now() - startTotal) / 1000).toFixed(1)}s! Total: ${completed}`);
    }
    return;
  }

  const file = mp4Files[index++];
  const baseName = path.basename(file, '.mp4');
  const srcFile = path.join(sourceDir, file);
  const dstFile = path.join(destDir, `${baseName}.gif`);

  // Skip if already generated and non-empty
  if (fs.existsSync(dstFile) && fs.statSync(dstFile).size > 10000) {
    completed++;
    runNext();
    return;
  }

  active++;
  // Convert 10fps, width 420px, 64 colors palette for optimal speed and lightweight crisp previews
  const cmd = `ffmpeg -y -i "${srcFile}" -vf "fps=10,scale=420:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${dstFile}"`;

  exec(cmd, (err) => {
    active--;
    if (err) {
      console.error(`Failed ${file}:`, err.message);
    } else {
      completed++;
      if (completed % 10 === 0 || completed === mp4Files.length) {
        console.log(`Progress: ${completed}/${mp4Files.length} (${Math.round(completed / mp4Files.length * 100)}%)`);
      }
    }
    runNext();
  });
}

for (let i = 0; i < CONCURRENCY; i++) {
  runNext();
}
