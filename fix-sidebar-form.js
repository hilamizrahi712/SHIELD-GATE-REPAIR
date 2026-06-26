/**
 * Fix city page lead forms:
 * 1. Remove the wide cta-form-section added after the hero (wrong position)
 * 2. Replace the .cta-sidebar (blue call buttons box) with the compact form
 * 3. Append sidebar form CSS to style.css
 */
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);

function readF(p)  { return fs.readFileSync(p, 'utf8'); }
function writeF(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  wrote:', p.replace(ROOT, '')); }

function toTitleCase(slug) {
  const specials = {
    'desoto': 'DeSoto', 'north-richland-hills': 'North Richland Hills',
    'mckinney': 'McKinney', 'fort-worth': 'Fort Worth',
    'flower-mound': 'Flower Mound', 'grand-prairie': 'Grand Prairie',
    'cedar-hill': 'Cedar Hill', 'farmers-branch': 'Farmers Branch'
  };
  if (specials[slug]) return specials[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* ── 1. Add sidebar form CSS to style.css ── */
console.log('[CSS] Appending sidebar form styles...');
const cssPath = path.join(ROOT, 'css', 'style.css');
let css = readF(cssPath);
const newCss = `
/* ── City sidebar form (replaces cta-sidebar) ── */
.city-sidebar-form input,.city-sidebar-form textarea{width:100%;padding:10px 14px;border:1.5px solid rgba(255,255,255,.2);border-radius:var(--radius);font-size:.88rem;font-family:inherit;background:rgba(255,255,255,.08);color:var(--white);margin-bottom:11px;display:block;box-sizing:border-box}
.city-sidebar-form input::placeholder,.city-sidebar-form textarea::placeholder{color:rgba(255,255,255,.38)}
.city-sidebar-form input:focus,.city-sidebar-form textarea:focus{outline:none;border-color:var(--gold);background:rgba(255,255,255,.12)}
.city-sidebar-form textarea{resize:vertical;min-height:70px}
`;
if (!css.includes('city-sidebar-form')) {
  css += newCss;
  writeF(cssPath, css);
}

/* ── 2. Process every city page ── */
console.log('\n[CITIES] Processing city pages...');
const citiesDir = path.join(ROOT, 'cities');
let count = 0;

fs.readdirSync(citiesDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const citySlug = file.replace('-gate-repair.html', '');
  const cityName = toTitleCase(citySlug);
  const fp = path.join(citiesDir, file);
  let html = readF(fp);

  /* ── Step A: Remove the full-width cta-form-section added after the hero ── */
  // It starts with <section class="section cta-form-section"> and contains "Get Fast Gate Repair in"
  html = html.replace(
    /\n<section class="section cta-form-section">[\s\S]*?Get Fast Gate Repair in[\s\S]*?<\/section>\n/,
    '\n'
  );

  /* ── Step B: Replace .cta-sidebar with the sidebar form ── */
  const sidebarForm = `<div class="cta-sidebar" style="text-align:left;padding:26px 28px">
          <span class="section-tag" style="margin-bottom:10px">Schedule Service</span>
          <h3 style="color:var(--white);margin-bottom:5px;font-size:1.05rem">Request Service in ${cityName}</h3>
          <p style="color:rgba(255,255,255,.6);font-size:.82rem;margin-bottom:14px">We call back within 30 minutes.</p>
          <form class="formspree-form city-sidebar-form" action="https://formspree.io/f/xykqkqzr" method="POST">
            <input type="text" name="name" placeholder="Full Name" required>
            <input type="tel" name="phone" placeholder="Phone Number" required>
            <input type="text" name="address" placeholder="Street Address in ${cityName}">
            <textarea name="message" rows="2" placeholder="Gate issue (optional)&#8230;"></textarea>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;background:var(--gold);color:var(--navy)">Schedule Service &#8594;</button>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:8px">
              <a href="tel:+12147354314" class="sidebar-phone">+1 (214) 735-4314</a>
              <a href="sms:+12147354314" class="btn-text-us" style="font-size:.75rem;padding:5px 12px;margin-top:0">&#128172; Text</a>
            </div>
          </form>
        </div>`;

  // Match the cta-sidebar div (its children are h3/p/a tags — no nested divs — so first </div> closes it)
  const sidebarRegex = /<div class="cta-sidebar">[\s\S]*?<\/div>/;

  if (!sidebarRegex.test(html)) {
    console.log(`  WARN: no .cta-sidebar found in ${file}`);
    return;
  }

  // Only replace if it still has the old call button form (not already replaced)
  if (html.includes('city-sidebar-form')) {
    console.log(`  skip ${file} (already has sidebar form)`);
    return;
  }

  html = html.replace(sidebarRegex, sidebarForm);
  writeF(fp, html);
  count++;
});

/* ── Bump CSS version ── */
console.log('\n[VERSION] Bumping CSS version to v=6...');
const dirsToVersion = [
  ROOT,
  path.join(ROOT, 'cities'),
  path.join(ROOT, 'brands'),
  path.join(ROOT, 'services'),
];
let vCnt = 0;
for (const dir of dirsToVersion) {
  if (!fs.existsSync(dir)) continue;
  fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.html')) return;
    const fp = path.join(dir, f);
    let h = fs.readFileSync(fp, 'utf8');
    if (h.includes('style.css?v=5') || h.includes('style.css?v=4')) {
      h = h.replace(/style\.css\?v=\d/g, 'style.css?v=6');
      fs.writeFileSync(fp, h);
      vCnt++;
    }
  });
}
console.log(`  Bumped CSS version in ${vCnt} files.`);

console.log(`\n✓ Done. Processed ${count} city pages. Ready to deploy.`);
