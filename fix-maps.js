/**
 * Replace Leaflet maps with Google Maps iframes — reliable, no CDN dependency
 */
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);

function readF(p)  { return fs.readFileSync(p, 'utf8'); }
function writeF(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  wrote:', p.replace(ROOT, '')); }

/* ── City coordinates ── */
const cityCoords = {
  'allen':               [33.1032, -96.6706],
  'arlington':           [32.7357, -97.1081],
  'bedford':             [32.8445, -97.1430],
  'burleson':            [32.5423, -97.3209],
  'carrollton':          [32.9537, -96.8903],
  'cedar-hill':          [32.5885, -96.9561],
  'colleyville':         [32.8887, -97.1503],
  'coppell':             [32.9543, -97.0157],
  'dallas':              [32.7767, -96.7970],
  'denton':              [33.2148, -97.1331],
  'desoto':              [32.5996, -96.8573],
  'euless':              [32.8371, -97.0820],
  'farmers-branch':      [32.9268, -96.8836],
  'flower-mound':        [33.0146, -97.0969],
  'fort-worth':          [32.7555, -97.3308],
  'frisco':              [33.1507, -96.8236],
  'garland':             [32.9126, -96.6389],
  'grand-prairie':       [32.7460, -96.9978],
  'grapevine':           [32.9343, -97.0781],
  'hurst':               [32.8235, -97.1882],
  'irving':              [32.8140, -96.9489],
  'keller':              [32.9343, -97.2290],
  'lewisville':          [33.0462, -96.9942],
  'mansfield':           [32.5632, -97.1417],
  'mckinney':            [33.1972, -96.6397],
  'mesquite':            [32.7673, -96.5994],
  'north-richland-hills':[32.8342, -97.2289],
  'plano':               [33.0198, -96.6989],
  'richardson':          [32.9483, -96.7299],
  'roanoke':             [33.0026, -97.2225],
  'rowlett':             [32.9029, -96.5636],
  'southlake':           [32.9401, -97.1336],
  'weatherford':         [32.7587, -97.7981],
};

function toTitleCase(slug) {
  const specials = { 'desoto': 'DeSoto', 'north-richland-hills': 'North Richland Hills',
                     'mckinney': 'McKinney', 'fort-worth': 'Fort Worth',
                     'flower-mound': 'Flower Mound', 'grand-prairie': 'Grand Prairie',
                     'cedar-hill': 'Cedar Hill', 'farmers-branch': 'Farmers Branch' };
  if (specials[slug]) return specials[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* ── Fix homepage: replace Leaflet block with Google Maps iframe ── */
console.log('\n[INDEX] Replacing Leaflet map with Google Maps iframe...');
const indexPath = path.join(ROOT, 'index.html');
let idx = readF(indexPath);

// The Leaflet block starts at the <link rel="stylesheet" href="https://unpkg.com/leaflet...
// and ends after the closing </script> before </section>
// Replace the entire Leaflet block (link + div + 2 scripts) with plain iframe
const leafletBlockRegex = /<link rel="stylesheet" href="https:\/\/unpkg\.com\/leaflet[\s\S]*?<\/script>\s*(?=<\/section>)/;
const newHomepageMap = `<div style="position:relative;width:100%;height:420px;overflow:hidden">
    <iframe
      src="https://maps.google.com/maps?q=32.7767,-97.2845&z=10&output=embed&language=en&region=US"
      width="100%" height="100%"
      style="border:0;display:block" loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Shield Gate Repair service area — Dallas-Fort Worth"
      aria-label="Map of Dallas-Fort Worth service area">
    </iframe>
    <img
      src="images/brands/shield-logo.jpeg"
      alt="Shield Gate Repair"
      style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:none">
  </div>
  `;

if (leafletBlockRegex.test(idx)) {
  idx = idx.replace(leafletBlockRegex, newHomepageMap);
  writeF(indexPath, idx);
  console.log('  Homepage map fixed.');
} else {
  console.log('  WARN: Leaflet block not matched on index.html');
}

/* ── Fix city pages: replace Leaflet sections with Google Maps iframes ── */
console.log('\n[CITIES] Replacing Leaflet maps in all city pages...');
const citiesDir = path.join(ROOT, 'cities');
let cityCount = 0;

fs.readdirSync(citiesDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const citySlug = file.replace('-gate-repair.html', '');
  const coords = cityCoords[citySlug];
  if (!coords) { console.log(`  WARN: no coords for ${citySlug}`); return; }

  const cityName = toTitleCase(citySlug);
  const lat = coords[0], lon = coords[1];
  const fp = path.join(citiesDir, file);
  let html = readF(fp);

  // Remove Leaflet section (both the CSS link, the div, and the two scripts)
  // The pattern: <section ...>...<link leaflet...>...</script>\n</section>
  const leafletSectionRegex = /<section class="section section-alt" style="padding:50px 0 0">[\s\S]*?city-map-[^"]+[\s\S]*?<\/script>\s*\n<\/section>/;

  if (!leafletSectionRegex.test(html)) {
    // Check if section exists with a different pattern
    if (!html.includes('city-map-')) {
      console.log(`  SKIP ${file}: no Leaflet map found`);
      return;
    }
  }

  const gmapSection = `<section class="section section-alt" style="padding:50px 0 0">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Local Service</span>
      <h2>Gate Repair in ${cityName}</h2>
    </div>
  </div>
  <div style="position:relative;width:100%;height:360px;overflow:hidden">
    <iframe
      src="https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed&language=en&region=US"
      width="100%" height="100%"
      style="border:0;display:block" loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Shield Gate Repair in ${cityName}, TX"
      aria-label="Gate repair map for ${cityName}, TX">
    </iframe>
    <img
      src="../images/brands/shield-logo.jpeg"
      alt="Shield Gate Repair — ${cityName}"
      style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;object-fit:contain;border-radius:50%;background:#fff;padding:5px;box-shadow:0 3px 16px rgba(0,0,0,0.45);pointer-events:none">
  </div>
</section>`;

  html = html.replace(leafletSectionRegex, gmapSection);
  writeF(fp, html);
  cityCount++;
});

console.log(`\n✓ Fixed ${cityCount} city pages.`);
console.log('Done. Now commit and deploy.');
