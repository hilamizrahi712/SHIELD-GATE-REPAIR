const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── Brand definitions ──────────────────────────────────────────────────────
const BRANDS = [
  { name: 'All-O-Matic',  img: 'brand-01.png', href: 'all-o-matic-gate-repair.html' },
  { name: 'LiftMaster',   img: 'brand-02.png', href: 'liftmaster-gate-repair.html' },
  { name: 'Viking',       img: 'brand-08.png', href: 'viking-gate-repair.html' },
  { name: 'DoorKing',     img: 'brand-03.png', href: 'doorking-gate-repair.html' },
  { name: 'FAAC',         img: '12.jpeg',       href: 'faac-gate-repair.html' },
  { name: 'Eagle',        img: 'brand-11.png', href: 'eagle-gate-repair.html' },
  { name: 'Apollo',       img: '14.jpeg',       href: 'apollo-gate-repair.html' },
  { name: 'HySecurity',   img: '15.jpeg',       href: 'hysecurity-gate-repair.html' },
  { name: 'Linear',       img: 'brand-10.png', href: 'linear-gate-repair.html' },
  { name: 'Elite',        img: 'brand-07.png', href: 'elite-gate-repair.html' },
  { name: 'Ramset',       img: 'brand-09.png', href: 'ramset-gate-repair.html' },
  { name: 'DoorBird',     img: 'brand-05.png', href: 'doorbird-gate-repair.html' },
  { name: 'BFT',          img: 'bft-logo.svg', href: 'bft-gate-repair.html' },
  { name: 'US Automatic', img: '13.jpeg',       href: 'us-automatic-gate-repair.html' },
];

function brandItemHtml(brand, prefix) {
  return [
    '      <a href="' + prefix + 'brands/' + brand.href + '" class="brand-service-item">',
    '        <img decoding="async" loading="lazy" src="' + prefix + 'images/brands/' + brand.img + '" alt="' + brand.name + '">',
    '        <span>' + brand.name + '</span>',
    '      </a>',
  ].join('\n');
}

function brandsListHtml(prefix) {
  return [
    '    <div class="brands-service-list reveal">',
    BRANDS.map(b => brandItemHtml(b, prefix)).join('\n'),
    '    </div>',
    '    <p class="text-center mt-16" style="color:var(--gray);font-size:0.9rem">Don\'t see your brand? <a href="tel:+12147354314" class="phone-link">+1 (214) 735-4314</a> — we service virtually every gate system.</p>',
  ].join('\n');
}

function fullBrandSection(prefix) {
  return [
    '',
    '<section class="section section-alt">',
    '  <div class="container">',
    '    <div class="section-header reveal">',
    '      <span class="section-tag">All Major Brands</span>',
    '      <h2>We Service Every Gate Brand</h2>',
    '      <p>Our technicians are trained and equipped for every major gate operator brand across the DFW Metroplex.</p>',
    '    </div>',
    brandsListHtml(prefix),
    '  </div>',
    '</section>',
    '',
  ].join('\n');
}

// ── 1. Fix service pages that already have a brands-service-list ───────────
const SERVICE_PAGES_WITH_BRANDS = [
  'services/gate-motor-repair.html',
  'services/electric-gate-repair.html',
  'services/automatic-gate-repair.html',
  'services/commercial-gate-repair.html',
  'services/iron-gate-repair.html',
  'services/access-control-repair.html',
];

SERVICE_PAGES_WITH_BRANDS.forEach(function(rel) {
  const fp = path.join(ROOT, rel);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // Replace entire brands-service-list block + trailing "Don't see" paragraph
  html = html.replace(
    /<div class="brands-service-list reveal">[\s\S]*?<p class="text-center mt-16"[^>]*>[\s\S]*?<\/p>/,
    brandsListHtml('../')
  );

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Fixed brands section:', rel);
  } else {
    console.log('WARNING - no match found in:', rel);
  }
});

// ── 2. Add brand section to pages without one ─────────────────────────────
const SERVICE_PAGES_WITHOUT_BRANDS = [
  'services/emergency-gate-repair.html',
  'services/gate-installation.html',
];

SERVICE_PAGES_WITHOUT_BRANDS.forEach(function(rel) {
  const fp = path.join(ROOT, rel);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // Insert before CONTACT FORM SECTION comment
  const anchor = '<!-- CONTACT FORM SECTION -->';
  if (html.includes(anchor)) {
    html = html.replace(anchor, fullBrandSection('../') + anchor);
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Added brands section:', rel);
  } else {
    console.log('WARNING - anchor not found in:', rel);
  }
});

// ── 3. Fix BFT brand page — add missing brand-hero-logo ──────────────────
const bftFp = path.join(ROOT, 'brands/bft-gate-repair.html');
let bftHtml = fs.readFileSync(bftFp, 'utf8');
const bftBefore = bftHtml;

// Other brand pages have <img class="brand-hero-logo"> right before the <h1> in .page-hero
bftHtml = bftHtml.replace(
  /<h1>BFT Gate Opener Repair in DFW<\/h1>/,
  '<img decoding="async" loading="lazy" src="../images/brands/bft-logo.svg" alt="BFT Gate Operator" class="brand-hero-logo">\n    <h1>BFT Gate Opener Repair in DFW</h1>'
);

if (bftHtml !== bftBefore) {
  fs.writeFileSync(bftFp, bftHtml, 'utf8');
  console.log('Added BFT logo to brands/bft-gate-repair.html');
} else {
  console.log('WARNING - BFT logo insertion found no match');
}

// ── 4. Add BFT to the index.html carousel if not present ─────────────────
const indexFp = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexFp, 'utf8');
const indexBefore = indexHtml;

if (!indexHtml.includes('bft-logo.svg')) {
  // Add BFT right before the </div><!--/brands-carousel-track--> closing section
  // Find last brand-item in carousel and insert after it
  indexHtml = indexHtml.replace(
    /(<a href="brands\/hysecurity-gate-repair\.html" class="brand-item">[\s\S]*?<\/a>)([\s\S]*?<\/div><!-- ?brands carousel ?-->|[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>)/,
    function(match, lastBrand, rest) {
      const bftItem = [
        '',
        '        <a href="brands/bft-gate-repair.html" class="brand-item">',
        '          <img decoding="async" loading="lazy" src="images/brands/bft-logo.svg" alt="BFT Gate Repair DFW">',
        '        </a>',
      ].join('\n');
      return lastBrand + bftItem + rest;
    }
  );

  if (indexHtml !== indexBefore) {
    fs.writeFileSync(indexFp, indexHtml, 'utf8');
    console.log('Added BFT to index.html carousel');
  } else {
    console.log('INFO: Could not find carousel insertion point in index.html - will skip');
  }
} else {
  console.log('BFT already in index.html carousel');
}

console.log('\nAll done.');
