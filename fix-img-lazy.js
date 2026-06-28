const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const dirs = [
  ROOT,
  path.join(ROOT, 'cities'),
  path.join(ROOT, 'services'),
  path.join(ROOT, 'brands'),
];

let totalFiles = 0;
let totalImgs = 0;

dirs.forEach(function(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(function(file) {
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    let count = 0;

    // Process each <img tag
    html = html.replace(/<img(\s[^>]*)?>/gi, function(tag) {
      let modified = tag;

      // Add loading="lazy" if not present
      if (!/\bloading\s*=/i.test(modified)) {
        modified = modified.replace(/<img/i, '<img loading="lazy"');
        count++;
      }

      // Add decoding="async" if not present
      if (!/\bdecoding\s*=/i.test(modified)) {
        modified = modified.replace(/<img/i, '<img decoding="async"');
      }

      return modified;
    });

    if (html !== before) {
      fs.writeFileSync(fp, html, 'utf8');
      totalFiles++;
      totalImgs += count;
      console.log('Updated:', path.relative(ROOT, fp), '(' + count + ' imgs)');
    }
  });
});

console.log('\nDone. ' + totalFiles + ' files updated, ~' + totalImgs + ' images got loading=lazy');
