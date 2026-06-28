const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const citiesDir = path.join(ROOT, 'cities');

// Revert map-wrapper divs to plain iframes with loading="lazy"
const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.html'));
let mapFixed = 0;
files.forEach(function(file) {
  const fp = path.join(citiesDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  // Replace <div class="map-wrapper" data-src="URL"></div> with iframe
  const before = html;
  html = html.replace(
    /<div class="map-wrapper" data-src="([^"]+)"><\/div>/g,
    '<iframe src="$1" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
  );
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    mapFixed++;
    console.log('Map reverted:', file);
  }
});
console.log('Maps reverted:', mapFixed, 'files');
