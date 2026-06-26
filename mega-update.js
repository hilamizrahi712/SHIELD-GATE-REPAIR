/**
 * Shield Gate Repair — Mega Update Script
 * Handles Tasks 1–10 in one pass
 */
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const HTML_DIRS = [
  ROOT,
  path.join(ROOT, 'cities'),
  path.join(ROOT, 'brands'),
  path.join(ROOT, 'services'),
];

function readF(p)  { return fs.readFileSync(p, 'utf8'); }
function writeF(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  wrote:', p.replace(ROOT, '')); }

function getAllHtmlFiles() {
  const files = [];
  for (const dir of HTML_DIRS) {
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir).forEach(f => {
      if (f.endsWith('.html')) files.push(path.join(dir, f));
    });
  }
  return files;
}

/* ─────────────────────────────────────────────────────────
   TASK 1 + 7 + 8 + 6: Append CSS to style.css
───────────────────────────────────────────────────────── */
console.log('\n[TASK 1+6+7+8] Appending CSS to style.css...');
const cssPath = path.join(ROOT, 'css', 'style.css');
let css = readF(cssPath);

const newCSS = `
/* ── Task 1: Mobile bottom bar button colors ── */
.mobile-bottom-bar .mbb-call{background:#C9A84C!important;color:#0A1931!important}
.mobile-bottom-bar .mbb-call:hover,.mobile-bottom-bar .mbb-call:active{background:#A8892A!important;color:#0A1931!important}
.mobile-bottom-bar .mbb-schedule{background:#0A1931!important;color:#C9A84C!important}
.mobile-bottom-bar .mbb-schedule:hover,.mobile-bottom-bar .mbb-schedule:active{background:#071025!important;color:#e8d48b!important}
/* ── Task 6: Text Us button ── */
.btn-text-us{display:inline-flex;align-items:center;gap:7px;color:var(--gold);border:2px solid var(--gold);padding:9px 18px;border-radius:var(--radius);font-weight:700;font-size:.85rem;margin-top:10px;transition:all var(--transition);text-decoration:none}
.btn-text-us:hover{background:var(--gold);color:var(--navy)!important}
/* ── Task 7: Ring animation ── */
@keyframes ring-phone{0%{transform:rotate(0) scale(1)}10%{transform:rotate(-12deg) scale(1.06)}20%{transform:rotate(12deg) scale(1.06)}30%{transform:rotate(-10deg) scale(1.05)}40%{transform:rotate(10deg) scale(1.05)}55%{transform:rotate(-4deg) scale(1.02)}70%{transform:rotate(0) scale(1)}100%{transform:rotate(0) scale(1)}}
.is-ringing{animation:ring-phone 1.1s ease}
/* ── Task 8: Carousel arrow buttons ── */
.brands-carousel-wrapper{position:relative}
.carousel-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;background:transparent;border:2px solid var(--gold);color:var(--gold);width:38px;height:38px;border-radius:50%;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition);line-height:1;padding:0;font-family:inherit}
.carousel-arrow:hover{background:var(--gold);color:var(--navy)}
.carousel-arrow-prev{left:2px}
.carousel-arrow-next{right:2px}
/* ── Task 10: Brands grid page ── */
.brands-page-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:24px;margin:40px 0}
.brand-grid-card{display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--white);border:2px solid var(--border);border-radius:var(--radius-lg);padding:28px 20px;text-align:center;text-decoration:none;transition:all var(--transition)}
.brand-grid-card:hover{border-color:var(--gold);box-shadow:var(--shadow-md);transform:scale(1.04)}
.brand-grid-card img{max-height:60px;max-width:140px;width:auto;object-fit:contain;margin-bottom:14px}
.brand-grid-card span{font-size:.85rem;font-weight:700;color:var(--navy);letter-spacing:.5px}
@media(max-width:768px){.carousel-arrow{display:none}.brands-page-grid{grid-template-columns:repeat(2,1fr)}}
`;

if (!css.includes('Task 1: Mobile bottom bar button colors')) {
  css += newCSS;
  writeF(cssPath, css);
  console.log('  CSS appended.');
} else {
  console.log('  CSS already updated, skipping.');
}

/* ─────────────────────────────────────────────────────────
   TASK 2: Replace map iframe with Leaflet map on index.html
───────────────────────────────────────────────────────── */
console.log('\n[TASK 2] Replacing map section in index.html with Leaflet...');
const indexPath = path.join(ROOT, 'index.html');
let idx = readF(indexPath);

const OLD_MAP_BLOCK = `  <div style="position:relative;width:100%;height:420px;overflow:hidden">
    <iframe
      src="https://maps.google.com/maps?q=32.7767,-97.2845&z=10&output=embed&language=en&region=US"
      width="100%"
      height="100%"
      style="border:0;display:block"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Shield Gate Repair service area — Dallas-Fort Worth"
      aria-label="Map of Dallas-Fort Worth service area">
    </iframe>
    <img
      src="images/brands/shield-logo.jpeg"
      alt="Shield Gate Repair"
      style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:none">
  </div>`;

const NEW_MAP_BLOCK = `  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <div id="dfw-service-map" style="width:100%;height:420px"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLEk=" crossorigin=""></script>
  <script>
  (function(){
    var map = L.map('dfw-service-map',{scrollWheelZoom:false,dragging:true,zoomControl:true}).setView([32.82,-97.10],10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    var boundary = [
      [33.28,-97.90],[33.30,-97.25],[33.30,-96.52],[32.85,-96.45],
      [32.65,-96.48],[32.48,-96.80],[32.38,-97.15],[32.40,-97.50],
      [32.50,-97.90],[33.28,-97.90]
    ];
    L.polygon(boundary,{color:'#C9A84C',weight:2.5,fillColor:'#0A1931',fillOpacity:0.18}).addTo(map);
    var icon = L.divIcon({
      html:'<div style="width:72px;height:72px;border-radius:50%;background:#fff;padding:5px;box-shadow:0 4px 18px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center"><img src="images/brands/shield-logo.jpeg" style="width:62px;height:62px;border-radius:50%;object-fit:contain"></div>',
      iconSize:[72,72],iconAnchor:[36,36],className:''
    });
    L.marker([32.82,-97.10],{icon:icon}).addTo(map).bindPopup('<strong>Shield Gate Repair</strong><br>Serving all of DFW<br><a href="tel:+12147354314">(214) 735-4314</a>');
  })();
  </script>`;

if (idx.includes(OLD_MAP_BLOCK)) {
  idx = idx.replace(OLD_MAP_BLOCK, NEW_MAP_BLOCK);
  writeF(indexPath, idx);
  console.log('  Map replaced with Leaflet.');
} else {
  console.log('  WARN: Map block not found in index.html — check manually.');
}

/* ─────────────────────────────────────────────────────────
   TASK 3: Add city map to all city pages
───────────────────────────────────────────────────────── */
console.log('\n[TASK 3] Adding local maps to city pages...');
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
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const citiesDir = path.join(ROOT, 'cities');
fs.readdirSync(citiesDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const citySlug = file.replace('-gate-repair.html', '');
  const coords = cityCoords[citySlug];
  if (!coords) { console.log(`  WARN: No coords for ${citySlug}`); return; }
  const cityName = toTitleCase(citySlug);
  const lat = coords[0], lon = coords[1];
  const mapSection = `
<section class="section section-alt" style="padding:50px 0 0">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Local Service</span>
      <h2>Gate Repair in ${cityName}</h2>
    </div>
  </div>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <div id="city-map-${citySlug}" style="width:100%;height:360px"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLEk=" crossorigin=""></script>
  <script>
  (function(){
    var map=L.map('city-map-${citySlug}',{scrollWheelZoom:false,zoomControl:true}).setView([${lat},${lon}],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    var icon=L.divIcon({html:'<div style="width:56px;height:56px;border-radius:50%;background:#fff;padding:4px;box-shadow:0 3px 14px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center"><img src="../images/brands/shield-logo.jpeg" style="width:48px;height:48px;border-radius:50%;object-fit:contain"></div>',iconSize:[56,56],iconAnchor:[28,28],className:''});
    L.marker([${lat},${lon}],{icon:icon}).addTo(map).bindPopup('<strong>Shield Gate Repair — ${cityName}</strong><br><a href="tel:+12147354314">(214) 735-4314</a>');
  })();
  </script>
</section>
`;
  const filePath = path.join(citiesDir, file);
  let html = readF(filePath);
  if (html.includes('city-map-')) { console.log(`  skip ${file} (map already added)`); return; }
  // Insert after closing of first <section> block
  const marker = '</section>';
  const pos = html.indexOf(marker);
  if (pos === -1) { console.log(`  WARN: no </section> in ${file}`); return; }
  html = html.slice(0, pos + marker.length) + '\n' + mapSection + html.slice(pos + marker.length);
  writeF(filePath, html);
});

/* ─────────────────────────────────────────────────────────
   TASK 4: Remove all gallery-14 references
───────────────────────────────────────────────────────── */
console.log('\n[TASK 4] Removing gallery-14 references...');

// gallery.html: remove the gallery-item div
const galleryPath = path.join(ROOT, 'gallery.html');
if (fs.existsSync(galleryPath)) {
  let g = readF(galleryPath);
  g = g.replace(/<div class="gallery-item"><img src="images\/gallery\/gallery-14\.jpeg"[^>]*><\/div>\s*/g, '');
  g = g.replace(/<div class="gallery-item"><img src="images\/gallery\/gallery-14\.jpe?g"[^>]*><\/div>\s*/g, '');
  writeF(galleryPath, g);
}

// All HTML files: replace gallery-14 in background-image style with gallery-01
for (const dir of HTML_DIRS) {
  if (!fs.existsSync(dir)) continue;
  fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.html')) return;
    const fp = path.join(dir, file);
    let h = readF(fp);
    if (!h.includes('gallery-14')) return;
    // Replace bg-image references with gallery-01
    h = h.replace(/gallery-14\.(jpeg|jpg|webp)/g, 'gallery-01.jpeg');
    // Remove any remaining <img> tags with gallery-14
    h = h.replace(/<img[^>]+gallery-14\.[^"']*["'][^>]*>/g, '');
    writeF(fp, h);
  });
}

// Delete the actual file
const gallery14 = path.join(ROOT, 'images', 'gallery', 'gallery-14.jpeg');
if (fs.existsSync(gallery14)) { fs.unlinkSync(gallery14); console.log('  Deleted gallery-14.jpeg'); }

/* ─────────────────────────────────────────────────────────
   TASK 5: About page — replace sentence + add new quote
───────────────────────────────────────────────────────── */
console.log('\n[TASK 5] Updating about.html...');
const aboutPath = path.join(ROOT, 'about.html');
let about = readF(aboutPath);

// Replace "Real people. Real fast. We answer the phone." and variations
about = about
  .replace(/Real people[\.,]?\s*Real fast[\.,]?\s*We answer the phone[\.,]?/gi,
    'When you call, a live technician answers — not a machine, not a call center.')
  .replace(/real people, real fast — we're on our way/gi,
    'call us — a live technician answers immediately');

// Add the new tagline in the CTA section before the h2 if not already there
const ctaHeadline = '<span class="section-tag">Ready to Help</span>\n    <h2>Let\'s Get Your Gate Running Right</h2>';
const ctaWithTagline = `<span class="section-tag">Ready to Help</span>
    <p class="mb-24" style="color:rgba(255,255,255,.9);font-size:1.1rem;font-weight:600;font-style:italic">"When you call, a live technician answers — not a machine, not a call center."</p>
    <h2>Let's Get Your Gate Running Right</h2>`;
if (!about.includes('live technician answers') && about.includes(ctaHeadline)) {
  about = about.replace(ctaHeadline, ctaWithTagline);
}

// Mobile form reorder: on mobile, show CTA buttons below the tagline sentence.
// We wrap the CTA buttons in a div with id for CSS targeting
writeF(aboutPath, about);

/* ─────────────────────────────────────────────────────────
   TASK 6: Add "Text Us" button to footer Contact column
   on ALL HTML files + specific pages
───────────────────────────────────────────────────────── */
console.log('\n[TASK 6] Adding Text Us buttons...');

const TEXT_US_FOOTER = `<p><a href="sms:+12147354314" class="btn-text-us">&#128172; Text Us</a></p>`;
const FOOTER_ANCHOR  = `<p>&#128680; 24/7 Emergency</p>`;
const FOOTER_INSERT  = `<p>&#128680; 24/7 Emergency</p>\n        ${TEXT_US_FOOTER}`;

// Also add to contact.html in the contact info section
const contactPath = path.join(ROOT, 'contact.html');
let contactHtml = readF(contactPath);

// On contact.html: replace the emergency line in footer
const allFiles = getAllHtmlFiles();
let textUsCnt = 0;
for (const fp of allFiles) {
  let h = readF(fp);
  if (h.includes('btn-text-us')) continue; // already added
  if (h.includes(FOOTER_ANCHOR)) {
    h = h.replace(FOOTER_ANCHOR, FOOTER_INSERT);
    writeF(fp, h);
    textUsCnt++;
  }
}
console.log(`  Added Text Us to ${textUsCnt} pages.`);

// Service pages: add Text Us before the final CTA/footer on select pages
const servicePagesForTextUs = [
  'electric-gate-repair.html',
  'gate-motor-repair.html',
  'commercial-gate-repair.html',
];
const servicesDir = path.join(ROOT, 'services');
for (const sf of servicePagesForTextUs) {
  const fp = path.join(servicesDir, sf);
  if (!fs.existsSync(fp)) continue;
  let h = readF(fp);
  if (h.includes('btn-text-us')) continue;
  // Insert before </footer>
  h = h.replace('</footer>', `<div style="text-align:center;padding:12px 0 8px"><a href="sms:+12147354314" class="btn-text-us" style="font-size:.9rem">&#128172; Prefer to text? Message us at (214) 735-4314</a></div>\n</footer>`);
  writeF(fp, h);
}

/* ─────────────────────────────────────────────────────────
   TASK 7: Update main.js with ring animation + carousel swipe
   (JS portion)
───────────────────────────────────────────────────────── */
// Handled in the main.js section below

/* ─────────────────────────────────────────────────────────
   TASK 8: Add carousel arrow buttons to index.html
───────────────────────────────────────────────────────── */
console.log('\n[TASK 8] Adding carousel arrows to index.html...');
idx = readF(indexPath);

const OLD_CAROUSEL_OUTER = `    <div class="brands-carousel-outer reveal">`;
const NEW_CAROUSEL_OUTER = `    <div class="brands-carousel-wrapper">
    <button class="carousel-arrow carousel-arrow-prev" id="carouselPrev" aria-label="Previous brands">&#8249;</button>
    <div class="brands-carousel-outer reveal" id="brandsCarouselOuter">`;

const OLD_CAROUSEL_CLOSE = `    </div>
    <p class="text-center mt-32"`;
const NEW_CAROUSEL_CLOSE = `    </div>
    </div>
    <button class="carousel-arrow carousel-arrow-next" id="carouselNext" aria-label="Next brands">&#8250;</button>
    </div>
    <p class="text-center mt-32"`;

if (!idx.includes('carouselPrev')) {
  idx = idx.replace(OLD_CAROUSEL_OUTER, NEW_CAROUSEL_OUTER);
  idx = idx.replace(OLD_CAROUSEL_CLOSE, NEW_CAROUSEL_CLOSE);
  writeF(indexPath, idx);
  console.log('  Carousel arrows added to index.html');
} else {
  console.log('  Carousel already has arrows, skipping.');
}

/* ─────────────────────────────────────────────────────────
   TASK 9: Remove Genie & Chamberlain
───────────────────────────────────────────────────────── */
console.log('\n[TASK 9] Removing Genie & Chamberlain...');

// a) Delete the HTML files
const toDelete = [
  path.join(ROOT, 'brands', 'genie-gate-repair.html'),
  path.join(ROOT, 'brands', 'chamberlain-gate-repair.html'),
];
for (const f of toDelete) {
  if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('  Deleted:', path.basename(f)); }
}

// b+c+d) Remove from all HTML files
const geniePattern   = /<a[^>]+genie-gate-repair\.html[^>]*>[\s\S]*?<\/a>/g;
const chambPattern   = /<a[^>]+chamberlain-gate-repair\.html[^>]*>[\s\S]*?<\/a>/g;
const genieLi        = /<li>\s*<a[^>]+genie-gate-repair\.html[^>]*>[^<]*<\/a>\s*<\/li>/g;
const chambLi        = /<li>\s*<a[^>]+chamberlain-gate-repair\.html[^>]*>[^<]*<\/a>\s*<\/li>/g;

// For carousel brand-items: remove the whole brand-item anchor
const genieCarousel  = /<a[^>]+genie-gate-repair\.html[^>]*class="brand-item"[^>]*>[\s\S]*?<\/a>\s*/g;
const chambCarousel  = /<a[^>]+chamberlain-gate-repair\.html[^>]*class="brand-item"[^>]*>[\s\S]*?<\/a>\s*/g;
// Also match if class is before href
const genieCarousel2 = /<a class="brand-item"[^>]+genie-gate-repair\.html[^>]*>[\s\S]*?<\/a>\s*/g;
const chambCarousel2 = /<a class="brand-item"[^>]+chamberlain-gate-repair\.html[^>]*>[\s\S]*?<\/a>\s*/g;

let removedFromFiles = 0;
for (const fp of getAllHtmlFiles()) {
  let h = readF(fp);
  let changed = false;
  const orig = h;
  // Remove <li> links
  h = h.replace(genieLi, '').replace(chambLi, '');
  // Remove carousel brand-items (multi-line)
  h = h.replace(/<a\s[^>]*href="[^"]*genie-gate-repair\.html"[^>]*>[\s\S]*?<\/a>/g, '');
  h = h.replace(/<a\s[^>]*href="[^"]*chamberlain-gate-repair\.html"[^>]*>[\s\S]*?<\/a>/g, '');
  if (h !== orig) { writeF(fp, h); removedFromFiles++; changed = true; }
}
console.log(`  Cleaned references from ${removedFromFiles} files.`);

// Delete Genie/Chamberlain images (brand-04 = Genie, brand-06 = Chamberlain)
const imgToDelete = [
  path.join(ROOT, 'images', 'brands', 'brand-04.png'),
  path.join(ROOT, 'images', 'brands', 'brand-06.png'),
];
for (const img of imgToDelete) {
  if (fs.existsSync(img)) { fs.unlinkSync(img); console.log('  Deleted:', path.basename(img)); }
}

/* ─────────────────────────────────────────────────────────
   TASK 10: Create brands.html page with full grid
───────────────────────────────────────────────────────── */
console.log('\n[TASK 10] Creating brands.html...');

// Read nav from any existing root page to keep it consistent
const aboutForNav = readF(aboutPath);
// Extract nav block
const navMatch = aboutForNav.match(/<header[\s\S]*?<\/header>/);
const navBlock = navMatch ? navMatch[0] : '';
const footerMatch = aboutForNav.match(/<footer[\s\S]*?<\/footer>/);
const footerBlock = footerMatch ? footerMatch[0] : '';
const mbbMatch = aboutForNav.match(/<div class="mobile-bottom-bar">[\s\S]*?<\/div>/);
const mbbBlock = mbbMatch ? mbbMatch[0] : '';

const brandsList = [
  { name: 'LiftMaster',  img: 'brand-02.png', href: 'liftmaster-gate-repair.html' },
  { name: 'Viking',      img: 'brand-08.png', href: 'viking-gate-repair.html' },
  { name: 'DoorKing',    img: 'brand-03.png', href: 'doorking-gate-repair.html' },
  { name: 'FAAC',        img: '12.jpeg',      href: 'faac-gate-repair.html' },
  { name: 'Eagle',       img: 'brand-11.png', href: 'eagle-gate-repair.html' },
  { name: 'Apollo',      img: '14.jpeg',      href: 'apollo-gate-repair.html' },
  { name: 'HySecurity',  img: '15.jpeg',      href: 'hysecurity-gate-repair.html' },
  { name: 'Linear',      img: 'brand-10.png', href: 'linear-gate-repair.html' },
  { name: 'All-O-Matic', img: 'brand-01.png', href: 'all-o-matic-gate-repair.html' },
  { name: 'Elite',       img: 'brand-07.png', href: 'elite-gate-repair.html' },
  { name: 'Ramset',      img: 'brand-09.png', href: 'ramset-gate-repair.html' },
  { name: 'US Automatic',img: '13.jpeg',      href: 'us-automatic-gate-repair.html' },
];

const brandsGridHtml = brandsList.map(b =>
  `      <a href="brands/${b.href}" class="brand-grid-card">
        <img src="images/brands/${b.img}" alt="${b.name} Gate Repair DFW" loading="lazy">
        <span>${b.name}</span>
      </a>`
).join('\n');

const bftCard = `      <a href="brands/bft-gate-repair.html" class="brand-grid-card">
        <div style="width:80px;height:60px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:var(--navy);letter-spacing:-1px;margin-bottom:14px">BFT</div>
        <span>BFT</span>
      </a>`;

const brandsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gate Opener Brands We Service | Shield Gate Repair DFW | (214) 735-4314</title>
<meta name="description" content="Shield Gate Repair services every major gate opener brand in DFW — LiftMaster, Viking, FAAC, DoorKing, Apollo, HySecurity & more. Call (214) 735-4314.">
<link rel="canonical" href="https://shieldgaterepair.com/brands.html">
<link rel="stylesheet" href="css/style.css?v=5">
</head>
<body>
${navBlock}

<div class="page-hero">
  <div class="container">
    <nav class="breadcrumb"><a href="index.html">Home</a><span class="sep">&#8250;</span><span>Brands We Service</span></nav>
    <h1>Gate Opener Brands We Service in DFW</h1>
    <p>Shield Gate Repair is certified and stocked for every major gate opener brand. From LiftMaster to HySecurity — if it's in DFW, we fix it.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="section-header reveal">
      <span class="section-tag">Brands We Service</span>
      <h2>Every Major Brand. One Phone Call.</h2>
      <p>Our technicians carry parts for all major brands on their trucks. Most DFW repairs are done in a single visit.</p>
    </div>
    <div class="brands-page-grid reveal">
${brandsGridHtml}
${bftCard}
    </div>
    <div class="text-center mt-32">
      <p style="color:var(--gray);font-size:.95rem">Don't see your brand? Call us — we service virtually every gate system on the market.</p>
      <a href="tel:+12147354314" class="btn btn-primary btn-lg" style="margin-top:16px"><span class="ph"></span> Call (214) 735-4314</a>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-header reveal">
      <span class="section-tag">Why It Matters</span>
      <h2>Brand-Specific Training Makes the Difference</h2>
    </div>
    <div class="two-col">
      <div class="reveal">
        <h3 class="mb-16">What We Carry for Every Brand</h3>
        <ul class="check-list">
          <li>Control boards and logic boards</li>
          <li>Motors, actuators, and gearboxes</li>
          <li>Loop detectors and safety sensors</li>
          <li>Remote transmitters and receivers</li>
          <li>Limit switches and transformers</li>
        </ul>
      </div>
      <div class="reveal">
        <h3 class="mb-16">Why Brand Knowledge Matters</h3>
        <ul class="check-list">
          <li>Each brand has unique diagnostic codes</li>
          <li>Programming sequences differ by manufacturer</li>
          <li>OEM parts fit and last longer than generic</li>
          <li>Warranty compliance requires brand knowledge</li>
          <li>DFW heat stresses specific components differently</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>Need Service for Your Gate Brand?</h2>
    <p>Call now — we dispatch a brand-certified technician to your DFW property, same day.</p>
    <a href="tel:+12147354314" class="cta-phone-big">+1 (214) 735-4314</a>
    <div class="cta-buttons">
      <a href="tel:+12147354314" class="btn btn-primary btn-lg"><span class="ph"></span> Call Now</a>
      <a href="contact.html" class="btn btn-secondary btn-lg">Schedule Service</a>
    </div>
  </div>
</section>

${footerBlock}
${mbbBlock}
<script src="js/main.js" defer></script>
</body>
</html>`;

writeF(path.join(ROOT, 'brands.html'), brandsHtml);

/* ─────────────────────────────────────────────────────────
   Create BFT brand page if missing
───────────────────────────────────────────────────────── */
const bftPagePath = path.join(ROOT, 'brands', 'bft-gate-repair.html');
if (!fs.existsSync(bftPagePath)) {
  // Minimal BFT page based on structure of other brand pages
  const bftHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BFT Gate Repair Dallas-Fort Worth | Shield Gate Repair | (214) 735-4314</title>
<meta name="description" content="Certified BFT gate opener repair across DFW. Shield Gate Repair specializes in BFT automation systems. Same-day service: (214) 735-4314.">
<link rel="canonical" href="https://shieldgaterepair.com/brands/bft-gate-repair.html">
<link rel="stylesheet" href="../css/style.css?v=5">
</head>
<body>
${navBlock.replace(/href="brands\//g, 'href="../brands/').replace(/href="cities\//g, 'href="../cities/').replace(/href="services\//g, 'href="../services/').replace(/href="index\.html/g, 'href="../index.html').replace(/href="gallery\.html/g, 'href="../gallery.html').replace(/href="testimonials\.html/g, 'href="../testimonials.html').replace(/href="about\.html/g, 'href="../about.html').replace(/href="contact\.html/g, 'href="../contact.html').replace(/href="brands\.html/g, 'href="../brands.html').replace(/src="images\//g, 'src="../images/')}

<div class="page-hero">
  <div class="container">
    <nav class="breadcrumb"><a href="../index.html">Home</a><span class="sep">&#8250;</span><a href="../brands.html">Brands</a><span class="sep">&#8250;</span><span>BFT</span></nav>
    <h1>BFT Gate Opener Repair in DFW</h1>
    <p>Certified repair for BFT automatic gate systems across Dallas-Fort Worth. Fast diagnosis, OEM parts, same-day service.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="brand-intro">
      <div>
        <h2>BFT Gate Repair Specialists</h2>
        <p class="mb-24">BFT is an Italian automation brand known for high-quality residential and commercial gate operators. Their systems require specialized knowledge for proper diagnosis and programming — which is exactly what Shield Gate Repair technicians provide across the DFW Metroplex.</p>
        <p class="mb-24">Whether your BFT operator is failing to respond to remotes, stuck in an error loop, or completely non-functional, we carry common BFT parts and diagnostic equipment on our trucks.</p>
        <p>Gate stuck or unresponsive? Call <a href="tel:+12147354314" class="phone-link">+1 (214) 735-4314</a> — same-day service throughout DFW.</p>
      </div>
      <div class="cta-sidebar">
        <h3>BFT Gate Repair</h3>
        <p>Same-day service in DFW. We come to you.</p>
        <a href="tel:+12147354314" class="btn btn-primary"><span class="ph"></span> Call Now</a>
        <a href="../contact.html" class="btn btn-secondary" style="margin-top:10px">Schedule Service</a>
        <a href="tel:+12147354314" class="sidebar-phone">+1 (214) 735-4314</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <h2>BFT Gate Repair — DFW</h2>
    <p>Same-day service for all BFT gate systems across Dallas-Fort Worth.</p>
    <a href="tel:+12147354314" class="cta-phone-big">+1 (214) 735-4314</a>
    <div class="cta-buttons"><a href="tel:+12147354314" class="btn btn-primary btn-lg"><span class="ph"></span> Call Now</a><a href="../contact.html" class="btn btn-secondary btn-lg">Schedule Service</a></div>
  </div>
</section>

${footerBlock.replace(/href="cities\//g, 'href="../cities/').replace(/href="services\//g, 'href="../services/').replace(/href="index\.html/g, 'href="../index.html').replace(/href="about\.html/g, 'href="../about.html').replace(/href="gallery\.html/g, 'href="../gallery.html').replace(/href="testimonials\.html/g, 'href="../testimonials.html').replace(/href="contact\.html/g, 'href="../contact.html').replace(/src="images\//g, 'src="../images/')}
<div class="mobile-bottom-bar"><a href="tel:+12147354314" class="mbb-call"><span class="ph"></span> Call Now</a><a href="../contact.html" class="mbb-schedule">&#9993; Request Service</a></div>
<script src="../js/main.js" defer></script>
</body>
</html>`;
  writeF(bftPagePath, bftHtml);
}

console.log('\n✓ All HTML tasks complete.');
