const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);

const OLD_CALL = 'class="mbb-call"><span class="ph"></span> Call Now</a>';
const NEW_CALL = 'class="mbb-call" style="background:#C9A84C;color:#0A1931"><span class="ph"></span> Call Now</a>';

const OLD_SCH  = 'class="mbb-schedule">&#9993; Request Service</a>';
const NEW_SCH  = 'class="mbb-schedule" style="background:#0A1931;color:#C9A84C">&#9993; Request Service</a>';

const dirs = [ROOT, 'cities', 'brands', 'services'].map(d => path.join(ROOT, d));

let count = 0;
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.html')) return;
    const fp = path.join(dir, f);
    let h = fs.readFileSync(fp, 'utf8');

    // Skip if already applied
    if (h.includes('style="background:#C9A84C')) return;

    if (h.includes(OLD_CALL) && h.includes(OLD_SCH)) {
      h = h.replace(OLD_CALL, NEW_CALL);
      h = h.replace(OLD_SCH, NEW_SCH);
      // Also bump CSS v=7 → v=8 if missed
      h = h.replace(/style\.css\?v=7/g, 'style.css?v=8');
      fs.writeFileSync(fp, h);
      count++;
    } else {
      console.log('  WARN: pattern not found in', f);
    }
  });
});

console.log('Done. Inline styles applied to', count, 'files.');
