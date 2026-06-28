const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'images');
const MAX_KB = 150;
const MAX_W = 1400;
const QUALITY = 75;

function getAllImages(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(function(f) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      results = results.concat(getAllImages(fp));
    } else if (/\.(jpe?g|png)$/i.test(f)) {
      if (stat.size > MAX_KB * 1024) results.push(fp);
    }
  });
  return results;
}

const files = getAllImages(IMAGES_DIR);
console.log('Images over ' + MAX_KB + 'KB:', files.length);

(async function() {
  for (const fp of files) {
    const before = fs.statSync(fp).size;
    const ext = path.extname(fp).toLowerCase();
    try {
      const buf = await sharp(fp)
        .resize({ width: MAX_W, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();
      if (buf.length < before) {
        fs.writeFileSync(fp, buf);
        console.log(path.basename(fp) + ': ' + Math.round(before/1024) + 'KB → ' + Math.round(buf.length/1024) + 'KB');
      } else {
        console.log(path.basename(fp) + ': already optimal (' + Math.round(before/1024) + 'KB), skipped');
      }
    } catch(e) {
      console.error('Failed:', path.basename(fp), e.message);
    }
  }
  console.log('\nDone.');
})();
